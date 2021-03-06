import { WriteFileOptions, writeFileSync } from 'fs';

export class WriteFile {

  public sync(path: string, data: any, options?: WriteFileOptions): void {
    writeFileSync(path, data, options);
  }

}
