const { spawn } = require('child_process');

const runCommand = (cmd, forcedExitCode = null) => {
  const child = spawn(cmd, [], { shell: true, stdio: 'inherit' });
  child.on('exit', code => {
    process.exit(forcedExitCode === null ? code : forcedExitCode);
  });

  // When we ^C out of the parent Node script, also interrupt the child
  process.on('SIGINT', () => {
    child.kill('SIGINT');
  });
};

module.exports = {
  runCommand,
};
