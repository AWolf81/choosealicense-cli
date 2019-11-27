import colors from 'colors';
import Table from 'cli-table';
import api from './api';

export default async () => {
  const licenses = await api.getLicenses();

  const table = new Table({
    head: ['no.', 'SPDX license code', 'Name', 'URL'].map(h =>
      colors.blue(h),
    ),
    colWidths: [5, 20, 50, 50],
  });

  if (Array.isArray(licenses)) {
    licenses.forEach((license, index) => {
      table.push([
        index,
        license.spdx_id,
        license.name,
        `http://choosealicense.com/licenses/${license.key.toLowerCase()}`,
      ]);
    });
  } else {
    // API rate limit maybe exceeded --> how to handle it? How many are allowed with-out auth?
    console.log(colors.green(licenses.message));
    process.exit(1);
  }

  console.log(table.toString());

  return licenses;
};
