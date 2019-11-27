import babel from 'rollup-plugin-babel';
import shebang from 'rollup-plugin-add-shebang';

module.exports = {
  input: './src/main.js',
  output: {
    file: './bin/choosealicense.js',
    format: 'cjs',
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    shebang({
      // A single or an array of filename patterns. Defaults to ['**/cli.js', '**/bin.js'].
      include: 'bin/choosealicense.js',
      // you could also 'exclude' here
      // or specify a special shebang (or a function returning one) using the 'shebang' option
    }),
  ],
};
