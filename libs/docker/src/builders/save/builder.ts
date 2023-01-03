import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { SaveBuilderSchema } from './schema';
import { json } from '@angular-devkit/core';
import { DockerSave } from './docker-save';

export interface Target extends json.JsonObject {
  project: string;
  target: string;
  configuration: string;
}


export class Builder {

  public static Run(
    options: SaveBuilderSchema,
    context: BuilderContext
  ) {
    return new Builder(options, context).run();
  }

  public static Create(): any {
    return createBuilder(Builder.Run);
  }

  constructor(
    public readonly options: SaveBuilderSchema,
    public readonly context: BuilderContext
  ) {}

  private getBuildTarget() {
    return {
      target: 'docker',
      project: this.context.target?.project!,
      configuration: this.context.target?.configuration!
    }
  }

  public async run(): Promise<BuilderOutput> {

    if (!this.context.target?.project) {
      throw new Error('The target project is not defined!');
    }

    const dockerSave = new DockerSave(this.context.logger as any);

    const destinationList: string[] = [];
    const buildTarget = this.getBuildTarget();
    const fallbackImageName = buildTarget.project;
    const buildTargetOptions = await this.context.getTargetOptions(buildTarget);

    const tagList = buildTargetOptions.tag as string[];

    if (!tagList?.length) {
      console.log('create registry tag');
      destinationList.push(this.getGitlabRegistryDestination(fallbackImageName, undefined, buildTarget.configuration, buildTargetOptions.imageName as string, buildTargetOptions.imageSuffix as string));
    } else {
      for (const tag of tagList) {
        destinationList.push(this.getGitlabRegistryDestination(fallbackImageName, tag, buildTarget.configuration, buildTargetOptions.imageName as string, buildTargetOptions.imageSuffix as string));
      }
    }

    if (process.env.LATEST || buildTargetOptions.latest) {
      destinationList.push(this.getGitlabRegistryDestination(fallbackImageName, 'latest', undefined, buildTargetOptions.imageName as string, buildTargetOptions.imageSuffix as string));
    }

    console.log(`start docker save for ${destinationList.join(', ')}`);

    let result = await dockerSave.executor(
      destinationList,
      this.context.target?.project
    );

    return { success: !Number(result) };

  }

  private getGitlabRegistryDestination(fallbackImageName?: string, imageTag?: string, fallbackImageTag?: string, imageName?: string, imageSuffix?: string) {
    const registryImage = process.env.REGISTRY_IMAGE ?? process.env.CI_REGISTRY_IMAGE ?? imageName ?? fallbackImageName;
    const registryImageTag = imageTag ?? process.env.REGISTRY_IMAGE_TAG ?? process.env.VERSION ?? process.env.CI_COMMIT_TAG ?? process.env.CI_COMMIT_BRANCH ?? fallbackImageTag ?? 'latest';
    return `${registryImage}${process.env.REGISTRY_IMAGE_SUFFIX ?? imageSuffix ?? ''}:${registryImageTag}`;
  }

}

export default Builder.Create();
