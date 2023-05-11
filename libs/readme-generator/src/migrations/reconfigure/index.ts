import { chain, externalSchematic, Rule } from '@angular-devkit/schematics';
import { getWorkspace } from '@nx/workspace';

export default function (): Rule {
  return async (host) => {
    const workspace = await getWorkspace(host);

    return chain(
      Array.from(workspace.projects.entries())
        .filter(([_, project]) => project.targets.has('readme'))
        .map(([name, project]) =>
          chain([
            (_, context) => {
              // TODO: workaround until issue is resolved: https://github.com/angular/angular-cli/issues/21131
              (context.engine as any)['_collectionCache'].delete(
                '@rxap/plugin-readme-generator'
              );
            },
            externalSchematic('@rxap/plugin-readme-generator', 'config', {
              project: name,
              overwrite: true,
              type: project.targets
                .get('readme')!
                .builder.match(/@rxap\/plugin-readme-generator:(.*)$/)![1],
            }),
          ])
        )
    );
  };
}
