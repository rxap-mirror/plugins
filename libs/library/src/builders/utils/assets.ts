import { copy } from 'fs-extra';
import * as glob from 'glob';
import { basename, join } from 'path';

export type FileInputOutput = {
  input: string;
  output: string;
};

export type AssetGlob = FileInputOutput & {
  glob: string;
  ignore: string[];
  dot?: boolean;
};

export async function CopyAssetFiles(files: FileInputOutput[]): Promise<{ success: boolean; error?: string }> {
  console.info('Copying asset files...');
  try {
    await Promise.all(files.map((file) => copy(file.input, file.output)));
    console.info('Done copying asset files.');
    return { success: true };
  } catch (err) {
    return { error: err.message, success: false };
  }
}

export function AssetGlobsToFiles(
  assets: Array<AssetGlob | string>,
  rootDir: string,
  outDir: string
): FileInputOutput[] {
  const files: FileInputOutput[] = [];

  const globbedFiles = (pattern: string, input = '', ignore: string[] = [], dot: boolean = false) => {
    return glob.sync(pattern, {
      cwd: input,
      nodir: true,
      dot,
      ignore
    });
  };

  assets.forEach((asset) => {
    if (typeof asset === 'string') {
      globbedFiles(asset, rootDir).forEach((globbedFile) => {
        files.push({
          input: join(rootDir, globbedFile),
          output: join(outDir, basename(globbedFile))
        });
      });
    } else {
      globbedFiles(
        asset.glob,
        join(rootDir, asset.input),
        asset.ignore,
        asset.dot ?? false
      ).forEach((globbedFile) => {
        files.push({
          input: join(rootDir, asset.input, globbedFile),
          output: join(outDir, asset.output, globbedFile)
        });
      });
    }
  });

  return files;
}
