import { spawn } from 'node:child_process';

const commands = [
  ['backend', ['run', 'start:dev', '--prefix', 'backend']],
  ['frontend', ['run', 'dev', '--prefix', 'frontend', '--', '--host', '127.0.0.1']],
];

const children = commands.map(([name, args]) => {
  const child = spawn('npm', args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  child.on('exit', (code, signal) => {
    if (shuttingDown) {
      return;
    }

    console.error(`${name} dev process exited (${signal ?? code})`);
    shutdown(code ?? 1);
  });

  return child;
});

let shuttingDown = false;

function shutdown(code = 0) {
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }

  setTimeout(() => process.exit(code), 300);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
