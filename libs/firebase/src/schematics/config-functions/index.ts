import { chain, Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
import { ConfigFunctionsSchema } from './schema';
import { UpdateJsonFile, UpdateProjectPackageJson } from '@rxap/schematics-utilities';
import { join } from 'path';
import { strings } from '@angular-devkit/core';
import { updateWorkspace } from '@nrwl/workspace';

const { dasherize } = strings;

export default function(options: ConfigFunctionsSchema): Rule {

  return async (host: Tree) => {

    return chain([
      updateWorkspace(workspace => {
        const project = workspace.projects.get(options.project);
        if (!project) {
          throw new SchematicsException(`The project '${options.project}' does not exists in the workspace.`);
        }
        const buildTarget = project.targets.get('build');
        if (!buildTarget) {
          throw new SchematicsException(`The project '${options.project}' does not have the target 'build'`);
        }
        buildTarget.options ??= {};
        buildTarget.options.generatePackageJson = true;
      }),
      UpdateProjectPackageJson(packageJson => {
        packageJson.engines = { node: '14' };
        packageJson.private = true;
      }, { create: true, projectName: options.project }),
      tree => {
        const mainFilePath = join('apps', dasherize(options.project), 'src', 'main.ts');
        if (tree.exists(mainFilePath)) {
          const content = tree.read(mainFilePath)!.toString();
          if (options.initial || content.includes(`console.log('Hello World!');`)) {
            tree.overwrite(mainFilePath, `import * as functions from "firebase-functions";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});
`);
          }
        } else {
          throw new SchematicsException(`FATAL: the main.ts file for the project '${options.project}' does not exists`);
        }
      },
      tree => {
        const firebaseJsonFilePath = 'firebase.json';
        if (tree.exists(firebaseJsonFilePath)) {
          return UpdateJsonFile(firebase => {
            if (!firebase.functions) {
              firebase.functions = {};
            }
            firebase.functions.source = join('dist', 'apps', dasherize(options.project));
            firebase.functions.predeploy = [ `yarn nx run ${dasherize(options.project)}:build` ];
          }, 'firebase.json');
        } else {
          throw new SchematicsException(`Make sure that firebase is initialized in the workspace. Run the command 'firebase init' to initialize firebase in the workspace. Don't select the creation of the functions folder`);
        }
      },
      () => {
        console.log(`Start creating firebase functions by editing the file 'apps/${dasherize(options.project)}/src/main.ts'`);
      }
    ]);

  };

}
