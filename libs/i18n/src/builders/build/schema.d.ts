export interface BuildBuilderSchema extends Record<string, any> {
  defaultLanguage?: string;
  availableLanguages?: string[];
  indexHtmlTemplate: string;
  assets?: string[] | boolean;
}
