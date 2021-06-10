import { chain, Rule, schematic } from '@angular-devkit/schematics';
import { NgAddSchema } from './schema';

export default function(options: NgAddSchema): Rule {
  return async () => {

    return chain([
      () => {
        if (options.project) {
          return schematic('config', {
            project: options.project,
            defaultLanguage: options.defaultLanguage ?? (Array.isArray(options.availableLanguages) && options.availableLanguages.length ? options.availableLanguages[0] : undefined),
            availableLanguages: options.availableLanguages,
            assets: options.assets
          });
        } else {
          console.log('Default project not defined. Add the i18n target to a project with: ng g @rxap/plugin-i18n:config [project]');
        }
      }
    ]);

  };
}
