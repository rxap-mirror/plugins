import * as cp from 'child_process';
import { logging } from '@angular-devkit/core';

export class DockerSave {

  constructor(private readonly logger: logging.LoggerApi) {}

  public spawn(command: string) {
    return new Promise((resolve, reject) => {
      const s = cp.spawn('sh', ['-c', command], { stdio: [ 0, 1, 2 ] });
      s.on('error', (err: Error & { code?: string }) => {
        if (err.code === 'ENOENT') {
          this.logger.error(`Could not execute command: ${command}`);
        } else {
          reject(err);
        }
      });
      s.on('close', resolve);
    });
  }

  public executor(destinationList: string[], outputName: string) {

    const args: string[] = [
      'docker',
      'save',
      ...destinationList,
      '|',
      'gzip',
      '>',
      `${outputName}.tar.gz`
    ];

    return this.spawn(args.join(' '));

  }

}
