import {
  BuilderContext,
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import { BuildBuilderSchema } from './schema';
import { json } from '@angular-devkit/core';
import { DockerBuild } from './docker-build';
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

  private getBuildTarget() {
    if (this.options.buildTarget) {
      return this.stringToTarget(this.options.buildTarget)
    } else {
      return {
        target: 'build',
        project: this.context.target?.project!,
        configuration: this.context.target?.configuration!
      }
    }
  }

  public async run(): Promise<BuilderOutput> {

    if (!this.context.target?.project) {
      throw new Error('The target project is not defined!');
    }

    const dockerBuild = new DockerBuild(this.context.logger as any);

    if (!this.options.context) {

      const buildTarget = this.getBuildTarget();

      const buildTargetOptions = await this.context.getTargetOptions(buildTarget);

      this.options.context = join(this.context.workspaceRoot, buildTargetOptions.outputPath as string);

    }

    console.log('login to registry');

    await this.loginToRegistry();

    const destinationList: string[] = [];
    const buildTarget = this.getBuildTarget();
    const fallbackImageName = buildTarget.project;

    if (this.options.tag && !Array.isArray(this.options.tag)) {
      this.options.tag = [ this.options.tag ];
    }

    if (!this.options.tag?.length) {
      console.log('create registry tag');
      destinationList.push(this.getGitlabRegistryDestination(fallbackImageName, undefined, buildTarget.configuration));
    } else {
      for (const tag of this.options.tag) {
        destinationList.push(this.getGitlabRegistryDestination(fallbackImageName, tag, buildTarget.configuration));
      }
    }

    if (process.env.LATEST || this.options.latest) {
      destinationList.push(this.getGitlabRegistryDestination(fallbackImageName, 'latest'));
    }

    console.log(`start docker build for ${this.options.dockerfile}`);

    const result = await dockerBuild.executor(
      this.options.command,
      this.options.context,
      destinationList,
      this.options.dockerfile,
    );

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
