import { logging } from '@angular-devkit/core';
import * as cp from 'child_process';

export class Yarn {

  constructor(private readonly logger: logging.LoggerApi) {}

  public spawn(args: string[]) {
    console.log(`$ yarn ${args.join(' ')}`);
    return new Promise<string>((resolve, reject) => {
      const s = cp.spawn('yarn', args, { stdio: [ 'ignore', 'pipe', 'inherit' ], shell: true });
      let output = '';
      s.on('error', (err: Error & { code?: string }) => {
        if (err.code === 'ENOENT') {
          this.logger.error('Yarn must be installed to use the CLI.');
        } else {
          reject(err);
        }
      });
      s.stdout.on(
        'data',
        (data: Buffer) => {
          output += data.toString('utf-8');
          console.log(data.toString('utf-8'));
        }
      );
      s.on('close', (d) => {
        resolve(output)
      });
    });
  }

}
