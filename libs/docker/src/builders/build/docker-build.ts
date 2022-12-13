import * as cp from 'child_process';
import { logging } from '@angular-devkit/core';

export class DockerBuild {

  constructor(private readonly logger: logging.LoggerApi) {}

  public spawn(command: string, args: string[]) {
    return new Promise((resolve, reject) => {
      console.log(`${command} build ${args.join(' ')}`);
      const s = cp.spawn(command, ['build', ...args], { stdio: [ 0, 1, 2 ] });
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

  public executor(command: string, context: string, destinationList: string[], dockerfile?: string) {

    const args: string[] = [];

    if (dockerfile) {
      args.push(`--file="${dockerfile}"`)
    }

    if (!destinationList.length) {
      throw new Error('At least one tag must be specified');
    }

    for (const destination of destinationList) {
      args.push(`--tag=${destination}`);
    }

    args.push(context);

    return this.spawn(command, args);

  }

}
