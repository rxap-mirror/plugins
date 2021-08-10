import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { BuildBuilderSchema } from './schema';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { basename, join } from 'path';
import { compile } from 'handlebars';
import { copy } from 'fs-extra';

export interface Target extends Record<string, any> {
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

  public async run(): Promise<BuilderOutput> {

    try {
      await this.createIndexHtml();
    } catch (e) {
      console.error(`Create index html failed: ${e.message}`);
      return { success: false, error: e.message };
    }

    try {
      await this.copyAssets();
    } catch (e) {
      console.error(`Copy assets failed: ${e.message}`);
      return { success: false, error: e.message };
    }

    return { success: true };

  }

  private async createIndexHtml() {
    const indexHtmlTemplateFilePath = this.options.indexHtmlTemplate;

    if (!indexHtmlTemplateFilePath) {
      throw new Error('The i18n index html template path is not defined');
    }

    const indexHtmlTemplateAbsoluteFilePath = join(this.context.workspaceRoot, indexHtmlTemplateFilePath);

    if (!existsSync(indexHtmlTemplateAbsoluteFilePath)) {
      throw new Error(`Could not find the i18n index html template in '${indexHtmlTemplateAbsoluteFilePath}'`);
    }

    const indexHtmlTemplateFile = readFileSync(indexHtmlTemplateAbsoluteFilePath).toString('utf-8');

    const indexHtmlTemplate = compile(indexHtmlTemplateFile);

    const indexHtml = indexHtmlTemplate(this.options);

    const outputPath = await this.getOutputPath();

    const indexHtmlFilePath = join(this.context.workspaceRoot, outputPath, 'index.html');

    if (existsSync(indexHtmlFilePath)) {
      console.warn(`The index.html file already exists in the location: '${indexHtmlFilePath}'`);
    }

    writeFileSync(indexHtmlFilePath, indexHtml);
  }

  private async getOutputPath(): Promise<string> {

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
    return outputPath;
  }

  private async copyFiles(pathList: string[]) {
    const outputPath = await this.getOutputPath();
    await Promise.all(pathList.map(async assetPath => {
      const assetOutputPath = join(outputPath, basename(assetPath));
      try {
        await copy(assetPath, assetOutputPath);
      } catch (e) {
        console.error(`Could not copy assets '${assetPath}' to '${outputPath}': ${e.message}`);
      }
    }));
  }

  private async copyAssets() {

    if (Array.isArray(this.options.assets) && this.options.assets.length) {
      await this.copyFiles(this.options.assets);
    } else if (typeof this.options.assets === 'boolean' && this.options.assets) {

      if (!this.context.target) {
        throw new Error('The current builder target is not defined in the context');
      }

      const buildOptions = await this.context.getTargetOptions({
        project: this.context.target.project,
        target: 'build'
      });

      if (Array.isArray(buildOptions.assets) && buildOptions.assets.length) {
        await this.copyFiles(buildOptions.assets as string[]);
      } else {
        console.info('Skip assets copy. The build target of this project has no assets specified.');
      }

    } else {
      console.info('Skip assets copy. No assets specified.');
    }

  }

}

export default Builder.Create();
