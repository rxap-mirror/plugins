import { chain, externalSchematic, noop, Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
import { ConfigSchematicsSchema } from './schema';
import { GetProjectRoot, UpdateAngularProject, UpdateProjectTsConfigJson } from '@rxap/schematics-utilities';
import { join, normalize, relative } from 'path';
import { InitSrcFiles } from './init-src-files';
import { CoerceMigrationJson } from './coerce-migration-json';
import { CoerceNgUpdate } from './coerce-ng-update';
import { CoerceCollectionJson } from './coerce-collection-json';
import { CoerceBuildersJson } from './coerce-builders-json';
import { CoerceSchematics } from './coerce-schematics';
import { CoerceBuilders } from './coerce-builders';

export default function(options: ConfigSchematicsSchema): Rule {

  return async (host: Tree) => {

    const projectRoot = GetProjectRoot(host, options.project);
    const relativePath = relative(normalize('/' + projectRoot), '/');

    let hasPackTarget: boolean | null = null;

    return chain([
      UpdateAngularProject(project => {

        if (!project.root) {
          throw new SchematicsException(`The root for the project '${options.project}' is not defined.`);
        }

        if (!project.targets.has(`build-${options.type}`)) {
          project.targets.add(`build-${options.type}`, {
            builder: '@rxap/plugin-library:build-schematics',
            options: {
              outputPath: join('dist', project.root),
              tsConfig: join(project.root, `tsconfig.${options.type}.json`),
              assets: [],
              type: options.type
            }
          });
        }

        hasPackTarget = project.targets.has('pack');

      }, { projectName: options.project }),
      UpdateProjectTsConfigJson(tsConfig => {

        tsConfig.extends = './tsconfig.json';
        if (!tsConfig.compilerOptions) {
          tsConfig.compilerOptions = {};
        }
        tsConfig.compilerOptions.module = 'commonjs';
        tsConfig.compilerOptions.outDir = join(relativePath, 'dist', options.type, projectRoot);
        tsConfig.compilerOptions.declaration = true;
        tsConfig.compilerOptions.esModuleInterop = true;
        tsConfig.compilerOptions.types = [ 'node' ];

        if (!tsConfig.exclude) {
          tsConfig.exclude = [];
        }
        if (!tsConfig.exclude.includes('**/*.spec.ts')) {
          tsConfig.exclude.push('**/*.spec.ts');
        }
        if (!tsConfig.exclude.includes('**/files/**')) {
          tsConfig.exclude.push('**/files/**');
        }

        tsConfig.include = [ `src/${options.type}/**/*.ts` ];

      }, {
        infix: options.type,
        project: options.project,
        create: true
      }),
      UpdateProjectTsConfigJson(tsConfig => {

        if (!tsConfig.exclude) {
          tsConfig.exclude = [];
        }

        if (!tsConfig.exclude.includes(`src/${options.type}/**`)) {
          tsConfig.exclude.push(`src/${options.type}/**`);
        }

      }, {
        infix: 'lib',
        project: options.project
      }),
      InitSrcFiles(options.project, options.type),
      options.type === 'migrations' ? CoerceNgUpdate(options.project) : noop(),
      options.type === 'migrations' ? CoerceMigrationJson(options.project) : noop(),
      options.type === 'schematics' ? CoerceSchematics(options.project) : noop(),
      options.type === 'schematics' ? CoerceCollectionJson(options.project) : noop(),
      options.type === 'builders' ? CoerceBuilders(options.project) : noop(),
      options.type === 'builders' ? CoerceBuildersJson(options.project) : noop(),
      () => {
        if (hasPackTarget === null) {
          throw new SchematicsException('It is unclear if the project has a the target "pack"');
        }
        if (hasPackTarget) {
          return externalSchematic('@rxap/plugin-pack', 'add-target', {
            project: options.project,
            target: `${options.project}:build-${options.type}`,
            preBuild: false
          });
        }
      }
    ]);

  };

}
