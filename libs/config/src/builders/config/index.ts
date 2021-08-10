import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { ConfigSchema } from './schema';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { json } from '@angular-devkit/core';

export interface Target extends json.JsonObject {
  project: string;
  target: string;
  configuration: string;
}

export class Builder {

  constructor(
    public readonly options: ConfigSchema,
    public readonly context: BuilderContext
  ) {
  }

  public static Run(
    options: ConfigSchema,
    context: BuilderContext
  ) {
    return new Builder(options, context).run();
  }

  public static Create(): any {
    return createBuilder(Builder.Run);
  }

  public async extractOutputPath(buildTarget: Target): Promise<string> {
    const buildTargetOptions = await this.context.getTargetOptions(buildTarget);

    const outputPath = buildTargetOptions.outputPath;

    if (!outputPath || typeof outputPath !== 'string') {
      throw new Error(
        `Could not extract output path for build target '${this.options.buildTarget}'`
      );
    }

    return outputPath;
  }

  public async run(): Promise<BuilderOutput> {

    const buildTarget = this.stringToTarget(this.options.buildTarget);

    const outputPath = await this.extractOutputPath(buildTarget);

    try {
      for (const key of Object.keys(process.env)) {
        if (key.match(/^RXAP_CONFIG/)) {
          const value = process.env[key];
          if (value) {
            let content: string;
            if (value.match(/^(\/[^/\s]*)+\/?$/)) {
              content = readFileSync(value).toString('utf-8');
            } else {
              content = value;
            }
            try {
              JSON.parse(content);
            } catch (e) {
              console.error(`Can not parse config from '${key}'`, content);
              return { success: false, error: `Can not parse config from '${key}'` };
            }
            writeFileSync(join(outputPath, this.createFileName(key)), content);
          }
        }
      }
    } catch (e) {
      console.error('Could not create config files: ' + e.message);
      return { success: false, error: e.message };
    }

    return { success: true };

  }

  private stringToTarget(str: string): Target {
    const split = str.split(':');
    if (split.length < 2) {
      throw new Error(`Can not convert string '${str}' into target`);
    }
    return {
      project: split[0],
      target: split[1],
      configuration: split[2]
    };
  }

  private createFileName(key: string): string {
    const match = key.match(/^RXAP_CONFIG_(.*)/);
    if (match) {
      const name = match[1].toLowerCase().replace(/_/g, '.');
      return [ 'config', name, 'json' ].join('.');
    }
    return 'config.json';
  }

}

export default Builder.Create();
