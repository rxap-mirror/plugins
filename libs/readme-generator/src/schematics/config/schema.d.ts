export interface ConfigSchema {
  project: string;
  type: 'library' | 'plugin';
  overwrite: boolean;
}
