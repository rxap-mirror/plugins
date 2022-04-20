import {
  BuilderContext,
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import { BuildBuilderSchema } from './schema';
import {
  existsSync,
  writeFileSync
} from 'fs';
import { join } from 'path';

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

  public async run(): Promise<BuilderOutput> {

    if (!this.context.target?.project) {
      throw new Error('The target project is not defined!');
    }

    const buildOptions = await this.context.getTargetOptions({
      target:        'build',
      project:       this.context.target?.project,
      configuration: this.context.target?.configuration!
    });

    const outputPath = buildOptions.outputPath;

    if (typeof outputPath !== 'string') {
      throw new Error(`Could not extract the output path from the build target with the configuration: '${this.context.target?.configuration}'`);
    }

    const buildInfo = this.options;

    if (!buildInfo.timestamp) {
      buildInfo.timestamp = process.env.CI_COMMIT_TIMESTAMP ?? new Date().toISOString();
    }

    if (!buildInfo.branch && process.env.CI_COMMIT_BRANCH) {
      buildInfo.branch = process.env.CI_COMMIT_BRANCH;
    }

    if (!buildInfo.tag && process.env.CI_COMMIT_TAG) {
      buildInfo.tag = process.env.CI_COMMIT_TAG;
    }

    if (!buildInfo.commit && process.env.CI_COMMIT_SHA) {
      buildInfo.commit = process.env.CI_COMMIT_SHA;
    }

    if (!buildInfo.name && process.env.CI_ENVIRONMENT_NAME) {
      buildInfo.name = process.env.CI_ENVIRONMENT_NAME;
    }

    if (!buildInfo.job && process.env.CI_JOB_ID) {
      buildInfo.job = process.env.CI_JOB_ID;
    }

    if (!buildInfo.pipeline && process.env.CI_PIPELINE_ID) {
      buildInfo.pipeline = process.env.CI_PIPELINE_ID;
    }

    if (!buildInfo.project && process.env.CI_PROJECT_ID) {
      buildInfo.project = process.env.CI_PROJECT_ID;
    }

    if (!buildInfo.runner && process.env.CI_RUNNER_ID) {
      buildInfo.runner = process.env.CI_RUNNER_ID;
    }

    if (!buildInfo.url && process.env.CI_ENVIRONMENT_URL) {
      buildInfo.url = process.env.CI_ENVIRONMENT_URL;
    }

    if (!buildInfo.tier && process.env.CI_ENVIRONMENT_TIER) {
      buildInfo.tier = process.env.CI_ENVIRONMENT_TIER;
    }

    if (!buildInfo.slug) {
      buildInfo.slug = {};
    }

    if (!buildInfo.slug.name && process.env.CI_ENVIRONMENT_SLUG) {
      buildInfo.slug.name = process.env.CI_ENVIRONMENT_SLUG
    }

    if (!buildInfo.slug.tag && process.env.CI_COMMIT_TAG && process.env.CI_COMMIT_REF_SLUG) {
      buildInfo.slug.tag = process.env.CI_COMMIT_REF_SLUG
    }

    if (!buildInfo.slug.branch && process.env.CI_COMMIT_BRANCH && process.env.CI_COMMIT_REF_SLUG) {
      buildInfo.slug.branch = process.env.CI_COMMIT_REF_SLUG
    }

    const buildJsonFile = JSON.stringify(buildInfo, undefined, 2);

    const buildInfoFilePath = join(this.context.workspaceRoot, outputPath, 'build.json');

    if (existsSync(buildInfoFilePath)) {
      console.warn(`The build.json file already exists in the location: '${buildInfoFilePath}'`);
    }

    console.log(buildInfoFilePath + ' : ', buildJsonFile);

    writeFileSync(buildInfoFilePath, buildJsonFile);

    console.log('Successfully created the build.json file.');
    console.log('build.json: ' + buildInfoFilePath);

    return { success: true };

  }

}

export default Builder.Create();
