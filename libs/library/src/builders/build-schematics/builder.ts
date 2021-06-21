import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { BuildMigrationsBuilderSchema } from './schema';
import { CompileTypeScript } from '../utils/compile-typescript-files';
import { join } from 'path';
import { AssetGlobsToFiles, CopyAssetFiles } from '../utils/assets';
import { removeSync } from 'fs-extra';

export class Builder {

  constructor(
    public readonly options: BuildMigrationsBuilderSchema,
    public readonly context: BuilderContext
  ) {
  }

  public static Run(
    options: BuildMigrationsBuilderSchema,
    context: BuilderContext
  ) {
    return new Builder(options, context).run();
  }

  public static Create(): any {
    return createBuilder(Builder.Run);
  }

  public async run(): Promise<BuilderOutput> {

    const projectName = this.context.target?.project;

    if (!projectName) {
      console.error('Could not access the project name');
      return { success: false, error: 'Could not access the project name' };
    }

    const metadata = await this.context.getProjectMetadata(projectName);
    const projectRoot = metadata.root as string | undefined;

    if (!projectRoot) {
      console.error('Could not access the project root');
      return { success: false, error: 'Could not access the project root' };
    }

    const outputPath = join(this.context.workspaceRoot, this.options.outputPath);

    const assets = this.options.assets ?? [];

    assets.push({
      input: `./${projectRoot}`,
      glob: this.getSchemaFileName(this.options.type),
      output: '.',
      ignore: []
    });

    assets.push({
      input: `./${projectRoot}/src/${this.options.type}`,
      glob: '**/schema.json',
      output: `./src/${this.options.type}`,
      ignore: []
    });

    assets.push({
      input: `./${projectRoot}/src/${this.options.type}`,
      glob: '**/files/**',
      output: `./src/${this.options.type}`,
      ignore: []
    });

    const files = AssetGlobsToFiles(assets, this.context.workspaceRoot, outputPath);

    removeSync(join(outputPath, 'src', this.options.type));

    const result = await CompileTypeScript({
      outputPath,
      tsConfig: this.options.tsConfig,
      projectName,
      projectRoot,
      deleteOutputPath: false
    });

    await CopyAssetFiles(files);

    return {
      ...result,
      outputPath: this.options.outputPath
    };

  }

  private getSchemaFileName(type: 'builders' | 'schematics' | 'migrations') {
    switch (type) {
      case 'builders':
        return 'builders.json';
      case 'schematics':
        return 'collection.json';
      case 'migrations':
        return 'migration.json';

      default:
        throw new Error(`The schematic build type '${type}' is not allowed`);

    }
  }

}

export default Builder.Create();
