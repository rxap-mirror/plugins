import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { HostingSchema } from './schema';
import { existsSync, readFileSync, writeFileSync } from 'fs';
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
      this.options.project = process.env.FIREBASE_PROJECT;
    }

    const yarn = new Yarn(this.context.logger);

    try {
      const args: string[] = [ 'firebase', this.options.channel === 'live' ? 'deploy' : `hosting:channel:deploy` ];

      if (this.options.channel === 'live') {
        args.push(`--only hosting:${this.options.target.join(',')}`);
      } else {
        args.push(this.options.channel);
        if (this.options.expires) {
          args.push(`--expires ${this.options.expires}`);
        }
        args.push(`--only ${this.options.target.join(',')}`);
      }

      if (this.options.token) {
        args.push(`--token ${this.options.token}`);
      }

      if (this.options.project) {
        args.push(`--project ${this.options.project}`);
      }

      args.push('--json');

      const output = await yarn.spawn(args);
      const url = this.extractHostingUrl(output);
      if (url) {
        this.updateDeployMap(url);
      } else {
        console.warn('Could not extract the deploy url')
      }
    } catch (e: any) {
      return { success: false, error: e.message };
    }

    return { success: true };

  }

  private extractHostingUrl(output: string) {
    let url: string | null = null;
    if (this.options.channel === 'live') {
      const match = output.match(/"hosting": "(.+)"/)
      if (match) {
        const hosting = match[1];
        const segments = hosting.split('/');
        const site = segments[3];
        url = `https://${site}.web.app`;
      }
    } else {
      const match = output.match(/"url": "(.+)"/)
      if (match) {
        url = match[1]
      }
    }
    return url;
  }

  private updateDeployMap(url: string) {
    const deployFile = join(this.context.workspaceRoot, 'dist', 'deploy-urls.json');
    let deploy: Record<string, string> = {}
    if (existsSync(deployFile)) {
      deploy = JSON.parse(readFileSync(deployFile).toString('utf-8'));
    }
    for (const target of this.options.target) {
      deploy[target] = url;
    }
    writeFileSync(deployFile, JSON.stringify(deploy, undefined, 2));
  }

}

export default Builder.Create();
