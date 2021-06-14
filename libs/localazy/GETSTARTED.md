> Dependent on your workspace configuration the `nx` command mused be replaced by `ng` and the file `workspace.json` with `angular.json`.

With the execution of the schematic `nx g @rxap/plugin-localazy:config --project [projectName]` the
builder `@rxap/plugin-localazy:download` and `@rxap/plugin-localazy:upload` are added to the specified project. If
the `localazy.json` is not yet created a default `localazy.json` is created. Check out
the [official documentation](https://localazy.com/docs/cli/the-basics) for a custom configuration.

### @rxap/plugin-localazy:download

The download task can be run with `nx run [projectName]:localazy-download`. This run script accepts all parameters as
the [localazy cli download](https://localazy.com/docs/cli/command-line-options#download-options) command. Optional the
parameters can be defined in the `workspace.json` in the builder options
object (`projects.[projectName].architect.localazy-download.options`). The Documentation of the available option can be
found in the section [Builder > download](#download).

### @rxap/plugin-localazy:upload

The upload task can be run with `ng run [projectName]:localazy-upload`. This run script accepts all parameters as
the [localazy cli upload](https://localazy.com/docs/cli/command-line-options#upload-options) command. Optional the
parameters can be defined in the `angular.json` or `workspace.json` in the builder options
object (`projects.[projectName].architect.localazy-upload.options`). The Documentation of the available option can be
found in the section [Builder > upload](#upload).

## @rxap/plugin-pack

To streamline the build process the [rxap pack plugin](https://www.npmjs.com/package/@rxap/plugin-pack) can be used.

Instead of calling multiple run targets manually:

```bash
$ nx run [projectName]:test
$ nx run [projectName]:localazy-download
$ nx run [projectName]:build
$ nx run [projectName]:build-info
```

Only calling one run target:

```bash
$ nx run [projectName]:pack
```

The [rxap pack plugin](https://www.npmjs.com/package/@rxap/plugin-pack) can be added with the
command `nx add @rxap/plugin-pack --project [projectName]`. To add the target `loaclazy-download` to the packed target
list run the schematic `nx g @rxap/plugin-localazy:config --project [projectName]`. Alternative if the
package `@rxap/plugin-localazy` is not yet added to the workspace run the
command `nx add @rxap/plugin-localazy --project [projectName]`.

