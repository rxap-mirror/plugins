import {
  BuilderContext,
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import { DownloadBuilderSchema } from './schema';
import { Yarn } from '../yarn';
import { GetAutoTag } from '../get-auto-tag';

export interface Target extends Record<string, any> {
  project: string;
  target: string;
  configuration: string;
}


export class Builder {

  public static Run(
    options: DownloadBuilderSchema,
    context: BuilderContext
  ) {
    return new Builder(options, context).run();
  }

  public static Create(): any {
    return createBuilder(Builder.Run);
  }

  constructor(
    public readonly options: DownloadBuilderSchema,
    public readonly context: BuilderContext
  ) {}

  public async run(): Promise<BuilderOutput> {

    if (process.env.LOCALAZY_WRITE_KEY) {
      this.options.writeKey = process.env.LOCALAZY_WRITE_KEY;
    }

    if (process.env.LOCALAZY_READ_KEY) {
      this.options.readKey = process.env.LOCALAZY_READ_KEY;
    }

    const yarn = new Yarn(this.context.logger);

    try {
      const args: string[] = ['localazy', 'download'];

      if (this.options.autoTag) {
        const tag = GetAutoTag();
        if (tag) {
          this.options.tag = tag;
        } else {
          console.warn('Could not get auto tag');
        }
      }

      if (this.options.readKey) {
        args.push(`--read-key ${ this.options.readKey }`);
      }

      if (this.options.writeKey) {
        args.push(`--write-key ${ this.options.writeKey }`);
      }

      if (this.options.configJson) {
        args.push(`--config "${ this.options.configJson }"`);
      }

      if (this.options.workingDirectory) {
        args.push(`--working-dir "${ this.options.workingDirectory }"`);
      }

      if (this.options.keysJson) {
        args.push(`--keys "${ this.options.keysJson }"`);
      }

      if (this.options.tag) {
        args.push(`--tag ${ this.options.tag }`);
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
        args.push(`--branch ${ this.options.branch }`);
      }

      if (this.options.param) {
        args.push(`--param ${ this.options.param }`);
      }

      if (this.options.failOnMissingGroups) {
        args.push('--failOnMissingGroups');
      }

      await yarn.spawn(args);
    } catch (e: any) {
      return { success: false, error: e.message };
    }

    return { success: true };

  }

}

export default Builder.Create();
