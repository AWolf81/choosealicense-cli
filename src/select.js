import list from './list';
import inquirer from 'inquirer';
import fs from 'fs';
import colors from 'colors';
import { execSync } from 'child_process';

import api from './api';

// LICENSE.test will be gitignored
const LICENSE_OUTPUT_FILENAME =
  process.env.NODE_ENV === 'development' ? 'LICENSE.test' : 'LICENSE';

// Don't modify the package.json of our project and create a test file (same content, just added license key)
const PACKAGE_JSON_OUTPUT_FILENAME =
  process.env.NODE_ENV === 'development'
    ? 'package.test.json'
    : 'package.json';

const gitUserName =
  execSync('git config user.name')
    .toString()
    .replace(/\r?\n|\r/, '') || '';

let questions = [
  {
    type: 'input',
    name: 'spdxSelected',
    default: 'MIT',
    message: 'Please select a license by typing SPDX code or no.',
  },
  {
    type: 'confirm',
    name: 'addLicenseFile',
    default: true,
    message: 'Do you want to add a LICENSE file?',
  },
  {
    type: 'input',
    name: 'userName',
    default: gitUserName,
    message: 'Please enter your full name',
  },
];

export default async (useDefaults = false, spdxSelected) => {
  let answers;

  const licenses = await list();

  console.log(licenses);
  // check if there is a package.json in root, if yes ask if the user wants to add the license key
  try {
    if (fs.existsSync('./package.json')) {
      // file exists
      questions.push({
        type: 'confirm',
        name: 'addToPackageJson',
        default: true,
        message:
          'Do you like to add/update the license key in your package.json?',
      });
    }
  } catch (err) {
    // nothing todo
  }

  if (useDefaults || spdxSelected) {
    // use the default for every question & do automatic answering
    questions = questions.map(question => ({
      ...question,
      when: answers => {
        let defaultValue = question.default;
        if (question.name === 'spdxSelected' && spdxSelected) {
          defaultValue = spdxSelected;
        }
        answers[question.name] = defaultValue;
        return false;
      },
    }));
  }
  answers = await inquirer.prompt(questions);

  // console.log(JSON.stringify(answers, null, 2)); // debugging only

  // handle selected license

  const spdx = isNaN(answers.spdxSelected)
    ? answers.spdxSelected.toUpperCase() // spdx entered
    : licenses[parseInt(answers.spdxSelected)].spdx_id; // index used
  const license = await api.getLicense(spdx);
  const year = new Date().getFullYear();

  if (license && license.body) {
    const licenseText = license.body
      .replace('[year]', year)
      .replace('[fullname]', answers.userName);

    if (answers.addLicenseFile) {
      fs.writeFile(
        `./${LICENSE_OUTPUT_FILENAME}`,
        licenseText,
        function(err) {
          if (err) {
            return console.log(err);
          }

          console.log('LICENSE file created!');
        },
      );
    } else {
      // just display license
      console.log(licenseText);
    }

    // add license key to package.json
    if (answers.addToPackageJson) {
      const packageJson = require(`${process.cwd()}/package.json`);
      packageJson.license = spdx;

      fs.writeFile(
        `./${PACKAGE_JSON_OUTPUT_FILENAME}`,
        JSON.stringify(packageJson, null, 2),
        err => {
          if (err) return console.log(err);
        },
      );
    }
  } else {
    console.log(
      colors.red(
        `License '${answers.spdxSelected}' not found. Please check the SPDX and try again.`,
      ),
    );
  }
};
