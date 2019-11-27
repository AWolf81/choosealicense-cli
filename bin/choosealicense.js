#!/usr/bin/env node

'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var commander = _interopDefault(require('commander'));
var colors = _interopDefault(require('colors'));
var Table = _interopDefault(require('cli-table'));
var fetch = _interopDefault(require('node-fetch'));
var to = _interopDefault(require('await-to-js'));
var inquirer = _interopDefault(require('inquirer'));
var fs = _interopDefault(require('fs'));
var child_process = require('child_process');

const GITHUB_LICENSE_API_URL = 'https://api.github.com/licenses';
const headers = {
  'Content-Type': 'application/json'
};

const errorHandler = error => {
  let errMessage = '';

  switch (error.code) {
    case 'ENOTFOUND':
      errMessage = `URL ${GITHUB_LICENSE_API_URL} not found. Please check your internet connection & try again.`;
      break;

    default:
      errMessage = error.message;
  }

  console.error(colors.red(errMessage));
};

var api = {
  getLicenses: async () => {
    const [err, response] = await to(fetch(GITHUB_LICENSE_API_URL, {
      method: 'GET',
      headers
    }));

    if (err) {
      errorHandler(err);
      process.exit(1);
    }

    return await response.json();
  },
  getLicense: async spdx => {
    const [err, response] = await to(fetch(`${GITHUB_LICENSE_API_URL}/${spdx}`, {
      method: 'GET',
      headers
    }));

    if (err) {
      errorHandler(err);
      process.exit(1);
    }

    return await response.json();
  }
};

var list = (async () => {
  const licenses = await api.getLicenses();
  const table = new Table({
    head: ['no.', 'SPDX license code', 'Name'].map(h => colors.blue(h)),
    colWidths: [5, 20, 50]
  });
  licenses.forEach((license, index) => {
    table.push([index, license.spdx_id, license.name]);
  });
  console.log(table.toString());
  return licenses;
});

const LICENSE_OUTPUT_FILENAME = process.env.NODE_ENV === 'development' ? 'LICENSE.test' : 'LICENSE'; // Don't modify the package.json of our project and create a test file (same content, just added license key)

const PACKAGE_JSON_OUTPUT_FILENAME = process.env.NODE_ENV === 'development' ? 'package.test.json' : 'package.json';
const gitUserName = child_process.execSync('git config user.name').toString().replace(/\r?\n|\r/, '') || '';
let questions = [{
  type: 'input',
  name: 'spdxSelected',
  default: 'MIT',
  message: 'Please select a license by typing SPDX code or no.'
}, {
  type: 'confirm',
  name: 'addLicenseFile',
  default: true,
  message: 'Do you want to add a LICENSE file?'
}, {
  type: 'input',
  name: 'userName',
  default: gitUserName,
  message: 'Please enter your full name'
}];
var select = (async (useDefaults = false) => {
  let answers;
  const licenses = await list(); // check if there is a package.json in root, if yes ask if the user wants to add the license key

  try {
    if (fs.existsSync('./package.json')) {
      // file exists
      questions.push({
        type: 'confirm',
        name: 'addToPackageJson',
        default: true,
        message: 'Do you like to add/update the license key in your package.json?'
      });
    }
  } catch (err) {// nothing todo
  }

  if (useDefaults) {
    // use the default for every question & do automatic answering
    questions = questions.map(question => ({ ...question,
      when: answers => {
        answers[question.name] = question.default;
        return false;
      }
    }));
  }

  answers = await inquirer.prompt(questions); // console.log(JSON.stringify(answers, null, 2)); // debugging only
  // handle selected license

  const spdx = isNaN(answers.spdxSelected) ? answers.spdxSelected // spdx entered
  : licenses[parseInt(answers.spdxSelected)].spdx_id; // index used

  const license = await api.getLicense(spdx);
  const year = new Date().getFullYear();

  if (license && license.body) {
    const licenseText = license.body.replace('[year]', year).replace('[fullname]', answers.userName);

    if (answers.addLicenseFile) {
      fs.writeFile(`./${LICENSE_OUTPUT_FILENAME}`, licenseText, function (err) {
        if (err) {
          return console.log(err);
        }

        console.log('LICENSE file created!');
      });
    } else {
      // just display license
      console.log(licenseText);
    } // add license key to package.json


    if (answers.addToPackageJson) {
      const packageJson = require(`${process.cwd()}/package.json`);

      packageJson.license = spdx;
      fs.writeFile(`./${PACKAGE_JSON_OUTPUT_FILENAME}`, JSON.stringify(packageJson, null, 2), err => {
        if (err) return console.log(err);
      });
    }
  } else {
    console.log(colors.red(`License '${answers.spdxSelected}' not found. Please check the SPDX and try again.`));
  }
});

const program = new commander.Command();
let cmdValue,
    useDefaults = false;
program.name('choosealicense').version('0.0.1', '-v, --version', 'output the current version');
program.command('list') // sub-command name
.alias('ls').description('List all licenses').action(function (cmd) {
  cmdValue = cmd;
}).action(list); // error on unknown commands

program.on('command:*', function () {
  console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
  process.exit(1);
});
program.option('-y', 'always use default', () => {
  useDefaults = true;
}); // allow commander to parse `process.argv`

program.parse(process.argv);

if (typeof cmdValue === 'undefined') {
  // no command -> do select flow
  select(useDefaults);
}
