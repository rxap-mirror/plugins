export interface ConfigSchema {
  project: string;
  dockerfile?: string;
  context?: string;
  buildTarget?: string;
  command?: string;
  imageSuffix?: string;
  imageName?: string;
  imageRegistry?: string;
  save?: boolean;
}
