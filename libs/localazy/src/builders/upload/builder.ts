import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { UploadBuilderSchema } from './schema';
import { Yarn } from '../yarn';
import { GetAutoTag } from '../get-auto-tag';

export interface Target extends Record<string, any> {
  project: string;
  target: string;
  configuration: string;
}


export class Builder {

  public static Run(
    options: UploadBuilderSchema,
    context: BuilderContext
  ) {
    return new Builder(options, context).run();
  }

  public static Create(): any {
    return createBuilder(Builder.Run);
  }

  constructor(
    public readonly options: UploadBuilderSchema,
    public readonly context: BuilderContext
  ) {
  }

  public async executeBuildTarget(buildTarget: Target): Promise<BuilderOutput> {
    const builderRun = await this.context.scheduleTarget(buildTarget);

    return builderRun.result;
  }

  private static stringToTarget(str: string): Target {
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

  public async run(): Promise<BuilderOutput> {

    if (process.env.LOCALAZY_WRITE_KEY) {
      this.options.writeKey = process.env.LOCALAZY_WRITE_KEY;
    }

    if (process.env.LOCALAZY_READ_KEY) {
      this.options.readKey = process.env.LOCALAZY_READ_KEY;
    }

    if (!this.options.extractTarget) {
      if (!this.context.target?.project) {
        return { error: 'Could not extract the current project', success: false };
      }
      this.options.extractTarget = this.context.target?.project + ':extract-i18n'
    }

    const readTarget = Builder.stringToTarget(this.context.target?.project + ':localazy-download');

    if (!this.options.readKey) {
      if (!this.context.target?.project) {
        return { error: 'Could not extract the current project', success: false };
      }
      try {
        const options = await this.context.getTargetOptions(readTarget);
        console.log('read options', options);
        if (this.options.readKey && typeof options.readKey === 'string') {
          this.options.readKey = options.readKey;
        }
      } catch (e) {
        console.warn('failed to get localazy-download target options');
      }
    }

    if (this.options.autoTag && !this.options.readKey) {
      console.log('Can not use auto tag without read key');
      console.log(`Tried to extract read key from ${JSON.stringify(readTarget)} target options`);
      return { success: false, error: 'Can not use auto tag without read key' };
    }

    const extractI18nTarget = Builder.stringToTarget(this.options.extractTarget);

    try {
      await this.executeBuildTarget(extractI18nTarget);
    } catch (e: any) {
      console.log(`Could not execute extract target: ${e.message}`);
      return { success: false, error: `Could not execute extract target: ${e.message}` };
    }

    const yarn = new Yarn(this.context.logger);

    try {
      const args: string[] = [ 'localazy', 'upload' ];

      if (this.options.readKey) {
        args.push('--read-key ' + this.options.readKey);
      }

      if (this.options.writeKey) {
        args.push('--write-key ' +  this.options.writeKey);
      }

      if (this.options.configJson) {
        args.push('--config "' +  this.options.configJson + '"');
      }

      if (this.options.workingDirectory) {
        args.push('--working-dir "' +  this.options.workingDirectory + '"');
      }

      if (this.options.keysJson) {
        args.push('--keys "' +  this.options.keysJson + '"');
      }

      if (this.options.version) {
        args.push('--app-version ' +  this.options.version);
      }

      if (this.options.dryRun) {
        args.push('--simulate');
      }

      if (this.options.quite) {
        args.push('--quiet');
      }

      if (this.options.force) {
        args.push('--force');
      }

      if (this.options.branch) {
        args.push(`--branch ${  this.options.branch }`);
      }

      if (this.options.param) {
        args.push(`--param ${  this.options.param }`);
      }

      if (this.options.failOnMissingGroups) {
        args.push('--failOnMissingGroups');
      }

      if (this.options.project) {
        args.push('--project ' +  this.options.project);
      }

      if (this.options.async) {
        args.push('--async');
      }

      if (this.options.disableContentLength) {
        args.push('--disable-content-length');
      }

      await yarn.spawn(args);
    } catch (e: any) {
      return { success: false, error: e.message };
    }

    if (this.options.autoTag) {
      const tag = GetAutoTag();
      if (tag) {
        this.options.tag = tag;
      } else {
        console.warn('Could not get auto tag');
      }
    }

    if (this.options.tag) {
      try {
        const args = [ 'localazy', 'tag', 'publish', this.options.tag ];
        if (this.options.readKey) {
          args.push('--read-key ' + this.options.readKey);
        }

        if (this.options.writeKey) {
          args.push('--write-key ' +  this.options.writeKey);
        }

        if (this.options.configJson) {
          args.push('--config "' +  this.options.configJson + '"');
        }

        if (this.options.workingDirectory) {
          args.push('--working-dir "' +  this.options.workingDirectory + '"');
        }
        if (this.options.keysJson) {
          args.push('--keys "' +  this.options.keysJson + '"');
        }
        await yarn.spawn(args);
      } catch (e: any) {
        console.error(`Could not run 'localazy tag publish ${ this.options.tag }'`, e.message);
        return {
          success: false,
          error: e.message,
        };
      }
    }

    return { success: true };

  }

}

export default Builder.Create();
