import commander from 'commander';
import list from './list';
import select from './select';

const program = new commander.Command();
let cmdValue,
  useDefaults = false;

program
  .name('choosealicense')
  .version('0.0.1', '-v, --version', 'output the current version');

program
  .command('list') // sub-command name
  .alias('ls')
  .description('List all licenses')
  .action(function(cmd) {
    cmdValue = cmd;
  })
  .action(list);

program
  .command('add <spdx>')
  .alias('install')
  .description('Add license to project')
  .action(spdx => {
    select(useDefaults, spdx);
  });

// error on unknown commands
program.on('command:*', function() {
  console.error(
    'Invalid command: %s\nSee --help for a list of available commands.',
    program.args.join(' '),
  );
  process.exit(1);
});

program.option('-y', 'always use default', () => {
  useDefaults = true;
});
// allow commander to parse `process.argv`
program.parse(process.argv);

if (program.args.length === 0) {
  // no command -> do select flow
  select(useDefaults);
}
