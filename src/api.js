import fetch from 'node-fetch';
import to from 'await-to-js';
import colors from 'colors';

const GITHUB_LICENSE_API_URL = 'https://api.github.com/licenses';

const headers = {
  'Content-Type': 'application/json',
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

export default {
  getLicenses: async () => {
    const [err, response] = await to(
      fetch(GITHUB_LICENSE_API_URL, {
        method: 'GET',
        headers,
      }),
    );
    if (err) {
      errorHandler(err);
      process.exit(1);
    }
    return await response.json();
  },
  getLicense: async spdx => {
    const [err, response] = await to(
      fetch(`${GITHUB_LICENSE_API_URL}/${spdx}`, {
        method: 'GET',
        headers,
      }),
    );
    if (err) {
      errorHandler(err);
      process.exit(1);
    }
    return await response.json();
  },
};
