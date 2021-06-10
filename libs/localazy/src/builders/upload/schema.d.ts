export interface UploadBuilderSchema extends Record<string, any> {
  readKey?: string;
  writeKey?: string;
  keysJson?: string;
  configJson?: string;
  workingDirectory?: string;
  dryRun?: boolean;
  quite?: boolean;
  force?: boolean;
  version?: number;
  extractTarget?: string;
}
