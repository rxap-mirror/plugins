import {
  apply,
  chain,
  externalSchematic,
  forEach,
  mergeWith,
  move,
  Rule,
  SchematicsException,
  template,
  url,
} from '@angular-devkit/schematics';
import { updateWorkspace } from '@nx/workspace';
import { ConfigSchema } from './schema';
import { join } from 'path';
import {
  AddPackageJsonDependency,
  GetPackageJson,
  GetProjectSourceRoot,
  UpdateAngularJson,
} from '@rxap/schematics-utilities';
import {
  NodePackageInstallTask,
  RunSchematicTask,
} from '@angular-devkit/schematics/tasks';

export default function (options: ConfigSchema): Rule {
  if (!options.availableLanguages) {
    options.availableLanguages = [];
  }

  if (!options.availableLanguages.includes(options.defaultLanguage)) {
    options.availableLanguages.push(options.defaultLanguage);
  }

  return async (host) => {
    const projectSourceRoot = GetProjectSourceRoot(host, options.project);

    return chain([
      mergeWith(
        apply(url('./files'), [
          template({}),
          move(projectSourceRoot),
          forEach((entry) => {
            if (host.exists(entry.path)) {
              if (options.overwrite) {
                host.overwrite(entry.path, entry.content);
              }
              return null;
            }
            return entry;
          }),
        ])
      ),
      updateWorkspace((workspace) => {
        const project = workspace.projects.get(options.project);

        if (!project) {
          throw new Error('Could not extract target project.');
        }

        if (!project.targets.has('i18n')) {
          project.targets.add({
            name: 'i18n',
            builder: '@rxap/plugin-i18n:build',
            options: {
              availableLanguages: options.availableLanguages,
              defaultLanguage: options.defaultLanguage,
              indexHtmlTemplate: join(projectSourceRoot, 'i18n.index.html.hbs'),
              assets: options.assets ?? [],
            },
          });
        } else if (options.overwrite) {
          const i18nTarget = project.targets.get('i18n')!;
          if (!i18nTarget.options) {
            i18nTarget.options = {};
          }
          i18nTarget.options.availableLanguages = options.availableLanguages;
          i18nTarget.options.defaultLanguage = options.defaultLanguage;
          i18nTarget.options.assets = options.assets ?? [];
          i18nTarget.options.indexHtmlTemplate = join(
            projectSourceRoot,
            'i18n.index.html.hbs'
          );
        }

        if (project.targets.has('extract-i18n')) {
          const extractI18n = project.targets.get('extract-i18n')!;
          if (!extractI18n.options) {
            extractI18n.options = {};
          }
          extractI18n.options.format = 'xliff2';
          if (!project.sourceRoot) {
            throw new SchematicsException(
              'The project source root is not defined'
            );
          }
          extractI18n.options.outputPath = join(project.sourceRoot, 'i18n');
        }

        if (project.targets.has('build')) {
          const build = project.targets.get('build')!;
          if (build.configurations?.production) {
            if (
              !build.configurations.production.localize ||
              options.overwrite
            ) {
              build.configurations.production.localize =
                options.availableLanguages ?? [];
            }
          }
        }

      }),
      UpdateAngularJson((angularJson) => {
        const project = angularJson.projects.get(options.project);

        if (!project) {
          throw new Error('Could not extract target project.');
        }

        if (!project.i18n.sourceLocale || options.overwrite) {
          project.i18n.sourceLocale = options.sourceLocale;
        }

        if (!project.i18n.locales || options.overwrite) {
          project.i18n.locales = {} as any;
        }

        if (options.availableLanguages) {
          for (const lang of options.availableLanguages) {
            if (!project.i18n.locales![lang] || options.overwrite) {
              if (!project.sourceRoot) {
                throw new SchematicsException(
                  'The project source root is not defined'
                );
              }
              project.i18n.locales![lang] = {
                baseHref: `${lang}/`,
                translation: join(project.sourceRoot, 'i18n', `${lang}.xlf`),
              };
            }
          }
        }
      }),
      (tree, context) => {
        const rootPackageJson = GetPackageJson(tree);
        const hasAngularLocalizePackage = Object.keys(
          rootPackageJson.dependencies ?? {}
        ).includes('@angular/localize');
        if (hasAngularLocalizePackage) {
          return externalSchematic('@angular/localize', 'ng-add', {
            name: options.project,
            useAtRuntime: true,
          });
        } else {
          AddPackageJsonDependency('@angular/localize')(tree, context);
          const installTaskId = context.addTask(new NodePackageInstallTask());
          context.addTask(
            new RunSchematicTask('@angular/localize', 'ng-add', {
              name: options.project,
              useAtRuntime: true,
            }),
            [installTaskId]
          );
        }
      },
    ]);
  };
}
