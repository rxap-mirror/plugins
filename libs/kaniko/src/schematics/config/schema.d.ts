export interface ConfigSchema {
  project: string;
  destination: string[];
  dockerfile?: string;
  context?: string;
  buildTarget?: string;
  command?: string;
  cache: boolean;
  latest: boolean;
}
