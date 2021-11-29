import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { FileReplacerSchema } from './schema';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { strings } from '@angular-devkit/core';

const { camelize } = strings;

export class Builder {

  constructor(
    public readonly options: FileReplacerSchema,
    public readonly context: BuilderContext
  ) {
    if (process.env.RXAP_FILE_REPLACER) {
      try {
        this.options.files = JSON.parse(process.env.RXAP_FILE_REPLACER);
      } catch (e) {
        this.context.logger.error('Could not parse the RXAP_FILE_REPLACER environment variable!');
      }
    }
  }

  public static Run(
    options: FileReplacerSchema,
    context: BuilderContext
  ) {
    return new Builder(options, context).run();
  }

  public static Create(): any {
    return createBuilder(Builder.Run);
  }

  public async run(): Promise<BuilderOutput> {

    if (!this.options.files) {
      return { success: true };
    }

    this.context.logger.info('Detect file replacement environment variable');

    const fileReplaceMap = new Map<string, Buffer>();

    this.context.logger.debug('Environment variable: ' + JSON.stringify(process.env, undefined, 2));

    for (const [ key, value ] of Object.entries(process.env).filter(([ key ]) => key.match(/^RXAP_REPLACE_/))) {
      this.context.logger.info(`Detect environment variable: '${key}'`);
      if (value && typeof value === 'string') {
        const match = key.match(/^RXAP_REPLACE_(.*)/)!;
        const fileIdentifier = camelize(match[1]);
        try {
          fileReplaceMap.set(fileIdentifier, this.getFileBuffer(value));
        } catch (e) {
          this.context.logger.error(`Could not convert environment variable '${key}' value to Buffer: ${e.message}`);
          return { success: false, message: e.message };
        }
      } else {
        this.context.logger.warn(`The environment variable '${key}' is empty!`);
      }
    }

    this.context.logger.info(`Replace detected files: ${fileReplaceMap.size}`);

    for (const [ key, file ] of fileReplaceMap.entries()) {
      const filePath = this.options.files[key];
      if (filePath) {
        try {
          writeFileSync(join(this.context.workspaceRoot, filePath), file);
        } catch (e) {
          this.context.logger.error(`Could not write file to ${filePath}: ${e.message}`);
          return { success: false, message: e.message };
        }
      }
    }

    return { success: true };

  }

  private getFileBuffer(value: string): Buffer {
    if (value.match(/^\/[^\/]+\//) && existsSync(value)) {
      return readFileSync(value);
    }

    return Buffer.from(value, 'base64');
  }

}

export default Builder.Create();
