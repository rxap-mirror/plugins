import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { HostingSchema } from './schema';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { json } from '@angular-devkit/core';
import { Yarn } from '../yarn';

export interface Target extends json.JsonObject {
  project: string;
  target: string;
  configuration: string;
}

export class Builder {

  constructor(
    public readonly options: HostingSchema,
    public readonly context: BuilderContext
  ) {
  }

  public static Run(
    options: HostingSchema,
    context: BuilderContext
  ) {
    return new Builder(options, context).run();
  }

  public static Create(): any {
    return createBuilder(Builder.Run);
  }

  public async run(): Promise<BuilderOutput> {

    if (process.env.FIREBASE_TOKEN) {
      this.options.token = process.env.FIREBASE_TOKEN;
    }

    if (process.env.FIREBASE_PROJECT) {
      this.options.token = process.env.FIREBASE_PROJECT;
    }

    const yarn = new Yarn(this.context.logger);

    try {
      const args: string[] = [ 'firebase', `hosting:channel:deploy` ];

      args.push(this.options.version);

      if (this.options.token) {
        args.push(`--token ${this.options.token}`);
      }

      if (this.options.project) {
        args.push(`--project ${this.options.project}`);
      }

      if (this.options.expires) {
        args.push(`--expires ${this.options.expires}`);
      }

      args.push(`--only ${this.options.target.join(',')}`)

      await yarn.spawn(args);
    } catch (e: any) {
      return { success: false, error: e.message };
    }

    return { success: true };

  }

}

export default Builder.Create();
