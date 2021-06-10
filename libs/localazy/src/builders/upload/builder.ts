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

  public async run(): Promise<BuilderOutput> {

    if (process.env.LOCALAZY_WRITE_KEY) {
      this.options.writeKey = process.env.LOCALAZY_WRITE_KEY;
    }

    if (process.env.LOCALAZY_READ_KEY) {
      this.options.readKey = process.env.LOCALAZY_READ_KEY;
    }

    const extractI18nTarget = this.stringToTarget(`${this.context.target.project}:extract-i18n`);

    try {
      await this.executeBuildTarget(extractI18nTarget);
    } catch (e) {
      if (e.message !== 'Project target does not exist.') {
        return { success: false, error: e.message };
      }
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
    } catch (e) {
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

}

export default Builder.Create();
