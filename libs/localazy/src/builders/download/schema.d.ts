export interface DownloadBuilderSchema extends Record<string, any> {
  branch?: string;
  param?: string;
  failOnMissingGroups?: boolean;
  readKey?: string;
  writeKey?: string;
  keysJson?: string;
  configJson?: string;
  workingDirectory?: string;
  dryRun?: boolean;
  quite?: boolean;
  force?: boolean;
  tag?: string;
  autoTag?: boolean;
}
