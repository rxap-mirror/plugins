import {
  BuilderContext,
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import { BuildBuilderSchema } from './schema';
import { json } from '@angular-devkit/core';
import { Kaniko } from './kaniko';
import { join } from 'path';
import { writeFileSync } from 'fs';

export interface Target extends json.JsonObject {
  project: string;
  target: string;
  configuration: string;
}


export class Builder {

  public static Run(
    options: BuildBuilderSchema,
    context: BuilderContext
  ) {
    return new Builder(options, context).run();
  }

  public static Create(): any {
    return createBuilder(Builder.Run);
  }

  constructor(
    public readonly options: BuildBuilderSchema,
    public readonly context: BuilderContext
  ) {}

  public async executeBuildTarget(buildTarget: Target): Promise<BuilderOutput> {
    const builderRun = await this.context.scheduleTarget(buildTarget);

    return builderRun.result;
  }

  public async run(): Promise<BuilderOutput> {

    if (!this.context.target?.project) {
      throw new Error('The target project is not defined!');
    }

    const kaniko = new Kaniko(this.context.logger as any);

    if (!this.options.context) {

      const buildTarget = this.stringToTarget(this.options.buildTarget);

      const buildTargetOptions = await this.context.getTargetOptions(buildTarget);

      this.options.context = join(this.context.workspaceRoot, buildTargetOptions.outputPath as string);

    }

    console.log('add registry configuration');

    this.addRegistryConfig();

    if (!this.options.destination?.length) {
      console.log('create registry destination');
      this.options.destination = [
        this.getGitlabRegistryDestination()
      ];
      if (process.env.LATEST || this.options.latest) {
        this.options.destination.push(this.getGitlabRegistryDestination('latest'));
      }
    }

    console.log(`start kaniko for ${this.options.dockerfile}`);

    const result = await kaniko.executor(
      this.options.command,
      this.options.context,
      this.options.destination,
      this.options.dockerfile,
      this.options.cache,
    );

    console.log('docker image build');

    return { success: !Number(result) };

  }

  private addRegistryConfig() {
    const username = process.env.REGISTRY_USER ?? process.env.CI_REGISTRY_USER;
    const password = process.env.REGISTRY_PASSWORD ?? process.env.CI_REGISTRY_PASSWORD;
    const registry = process.env.REGISTRY ?? process.env.CI_REGISTRY;
    writeFileSync('/kaniko/.docker/config.json', JSON.stringify({
      auths: {
        [registry + '']: {
          username,
          password
        }
      }
    }));
  }

  private getGitlabRegistryDestination(imageTag?: string) {
    const registryImage = process.env.REGISTRY_IMAGE ?? process.env.CI_REGISTRY_IMAGE;
    const registryImageTag = imageTag ?? process.env.REGISTRY_IMAGE_TAG ?? process.env.VERSION ?? process.env.CI_COMMIT_TAG ?? process.env.CI_COMMIT_BRANCH ?? 'latest';
    return `${registryImage}${process.env.REGISTRY_IMAGE_SUFFIX ?? this.options.imageSuffix ?? ''}:${registryImageTag}`;
  }

  private stringToTarget(str: string): Target {
    const split = str.split(':');
    if (split.length < 2) {
      throw new Error(`Can not convert string '${str}' into target`);
    }
    return {
      project:       split[ 0 ],
      target:        split[ 1 ],
      configuration: split[ 2 ]
    };
  }

}

export default Builder.Create();
