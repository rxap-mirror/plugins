import * as cp from 'child_process';
import { logging } from '@angular-devkit/core';

export class DockerLogin {

  constructor(private readonly logger: logging.LoggerApi) {}

  public spawn(command: string, args: string[]) {
    return new Promise((resolve, reject) => {
      const s = cp.spawn(command, ['login', ...args], { stdio: [ 0, 1, 2 ] });
      s.on('error', (err: Error & { code?: string }) => {
        if (err.code === 'ENOENT') {
          this.logger.error(`Could not find ${command}`);
        } else {
          reject(err);
        }
      });
      s.on('close', resolve);
    });
  }

  public executor(command: string, registry: string, username: string, password: string) {

    const args = [
      `--password="${password}"`,
      `--username="${username}"`,
    ];

    args.push(registry);

    return this.spawn(command, args);

  }

}
