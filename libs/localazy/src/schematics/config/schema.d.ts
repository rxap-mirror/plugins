export interface ConfigSchema {
  project: string;
  extractTarget?: string;
  writeKey?: string;
  readKey?: string;
  overwrite?: boolean;
}
