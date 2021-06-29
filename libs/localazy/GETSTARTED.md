> If not using the `ng add` command, but using a normal yarn or npm installation. Make sure that the @localazy/cli package is available in the workspace environment. To be sure, install the package in the workspace with `yarn add -D @localazy/cli`.

## Usage

> Depending on your workspace configuration, the command `nx` must be replaced by `ng` and the file `workspace.json` by `angular.json`.

Executing the `nx g @rxap/plugin-localazy:config --project [projectName]` scheme adds
the `@rxap/plugin-localazy:download` and `@rxap/plugin-localazy:upload` builders to the specified project. If
the `localazy.json` is not already created, a default `localazy.json` will be created. See
the [official documentation](https://localazy.com/docs/cli/the-basics) for a custom configuration.

### @rxap/plugin-localazy:download

The download task can be executed with `nx run [project name]:localazy-download`. This run script accepts all parameters
as the [localazy cli download](https://localazy.com/docs/cli/command-line-options#download-options) command. Optionally,
the parameters can be defined in the `workspace.json` in the builder options
object (`projects.[projectname].architect.localazy-download.options`). Documentation of the available option can be
found in the [Builder > download](#download) section.

### @rxap/plugin-localazy:upload

The upload task can be executed with `ng run [project name]:localazy-upload`. This run script accepts all parameters as
the [localazy cli upload](https://localazy.com/docs/cli/command-line-options#upload-options) command. Optionally, the
parameters can be defined in `angular.json` or `workspace.json` in the builder options
object (`projects.[projectname].architect.localazy-upload.options`). Documentation of the available option can be found
in the [Builder > upload](#upload) section.

## @rxap/plugin-pack

To streamline the build process, the [rxap pack plugin](https://www.npmjs.com/package/@rxap/plugin-pack) can be used.

Instead of manually calling multiple run targets:

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

## Environment Variables

In a CI environment, it is quite convenient to set the writeKey and readKey with environment variables.

When using the download and upload builders, the writeKey and readKey can be set with the environment
variables: `LOCALAZY_WRITE_KEY` and `LOCALAZY_READ_KEY`.

> If the Builder option writeKey or readKey is defined, the environment variables override these values.
