import { AssetGlob } from '../utils/assets';

export interface BuildMigrationsBuilderSchema extends Record<string, any> {
  outputPath: string;
  tsConfig: string;
  assets?: Array<AssetGlob | string>;
  type: 'builders' | 'schematics' | 'migrations'
}
