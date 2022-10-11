import {
  BuilderContext,
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import { BuildBuilderSchema } from './schema';
import { json } from '@angular-devkit/core';
import { DockerBuild } from './docker-build';
import { DockerPush } from './docker-push';
import { DockerLogin } from './docker-login';
import { join } from 'path';

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

    const dockerBuild = new DockerBuild(this.context.logger as any);

    if (!this.options.context) {

      const buildTarget = this.stringToTarget(this.options.buildTarget);

      const buildTargetOptions = await this.context.getTargetOptions(buildTarget);

      this.options.context = join(this.context.workspaceRoot, buildTargetOptions.outputPath as string);

    }

    console.log('login to registry');

    await this.loginToRegistry();

    if (!this.options.tag?.length) {
      console.log('create registry tag');
      const buildTarget = this.stringToTarget(this.options.buildTarget);
      const fallbackImageName = buildTarget.project;
      this.options.tag = [
        this.getGitlabRegistryDestination(fallbackImageName, undefined, buildTarget.configuration)
      ];
      if (process.env.LATEST || this.options.latest) {
        this.options.tag.push(this.getGitlabRegistryDestination(fallbackImageName, 'latest'));
      }
    }

    console.log(`start docker build for ${this.options.dockerfile}`);

    let result = await dockerBuild.executor(
      this.options.command,
      this.options.context,
      this.options.tag,
      this.options.dockerfile,
    );

    if (Number(result)) {
      return { success: false };
    }
    
    if (this.options.push) {
      const dockerPush = new DockerPush(this.context.logger as any);
      result = await dockerPush.executor(
        this.options.command,
        this.options.tag
      );
    }

    return { success: !Number(result) };

  }

  private async loginToRegistry() {
    const username = process.env.REGISTRY_USER ?? process.env.CI_REGISTRY_USER;
    const password = process.env.REGISTRY_PASSWORD ?? process.env.CI_REGISTRY_PASSWORD;
    const registry = process.env.REGISTRY ?? process.env.CI_REGISTRY;
    if (username && password && registry) {
      const dockerLogin = new DockerLogin(this.context.logger as any);
      await dockerLogin.executor(this.options.command, registry, username, password);
    }
  }

  private getGitlabRegistryDestination(fallbackImageName?: string, imageTag?: string, fallbackImageTag?: string) {
    const registryImage = process.env.REGISTRY_IMAGE ?? process.env.CI_REGISTRY_IMAGE ?? this.options.imageName ?? fallbackImageName;
    const registryImageTag = imageTag ?? process.env.REGISTRY_IMAGE_TAG ?? process.env.VERSION ?? process.env.CI_COMMIT_TAG ?? process.env.CI_COMMIT_BRANCH ?? fallbackImageTag ?? 'latest';
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
