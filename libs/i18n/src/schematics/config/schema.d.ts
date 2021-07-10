export interface ConfigSchema {
  project: string;
  defaultLanguage: string;
  availableLanguages?: string[];
  assets?: string[];
  sourceLocale: string;
  overwrite: boolean;
}
