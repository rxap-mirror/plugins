import * as cp from 'child_process';
import { logging } from '@angular-devkit/core';

export class DockerPush {

  constructor(private readonly logger: logging.LoggerApi) {}

  public spawn(command: string, args: string[]) {
    return new Promise((resolve, reject) => {
      console.log(`${command} push ${args.join(' ')}`);
      const s = cp.spawn(command, ['push', ...args], { stdio: [ 0, 1, 2 ] });
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

  public executor(command: string, tags: string[]) {

    if (!tags.length) {
      throw new Error('At least one tag must be specified');
    }

    return Promise.all(tags.map(tag => this.spawn(command, [tag])));

  }

}
