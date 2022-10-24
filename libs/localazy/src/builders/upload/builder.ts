import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { UploadBuilderSchema } from './schema';
import { Yarn } from '../yarn';

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

    if (!this.options.readKey) {
      if (!this.context.target?.project) {
        return { error: 'Could not extract the current project', success: false };
      }
      const readTarget = Builder.stringToTarget(this.context.target?.project + ':localazy-download');
      try {
        const options = await this.context.getTargetOptions(readTarget);
        if (options.readKey && typeof options.readKey === 'string') {
          this.options.readKey = options.readKey;
        }
      } catch (e) {
        console.warn('failed to get localazy-download target options');
      }
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
        args.push('-r ' + this.options.readKey);
      }

      if (this.options.writeKey) {
        args.push('-w ' + this.options.writeKey);
      }

      if (this.options.configJson) {
        args.push('-c "' + this.options.configJson + '"')
      }

      if (this.options.workingDirectory) {
        args.push('-d "' + this.options.workingDirectory + '"')
      }

      if (this.options.keysJson) {
        args.push('-k "' + this.options.keysJson + '"')
      }

      if (this.options.version) {
        args.push('-v ' + this.options.version)
      }

      if (this.options.dryRun) {
        args.push('-s');
      }

      if (this.options.quite) {
        args.push('-q');
      }

      if (this.options.force) {
        args.push('-f');
      }

      await yarn.spawn(args);
    } catch (e: any) {
      return { success: false, error: e.message };
    }

    return { success: true };

  }

}

export default Builder.Create();
