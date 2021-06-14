@rxap/plugin-localazy (Nx/Ng Plugin)
======

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-localazy?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-localazy)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-localazy)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-localazy)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-localazy)

> A Nx/Ng plugin localazy.com upload and download tasks.

- [Installation](#installation)
- [Get started](#get-started)
- [Schematics](#schematics)
- [Builder](#builder)

# Installation

Add the plugin to your workspace:

```
ng add @rxap/plugin-localazy
```

> Adds the localazy plugin to the workspace


*Configure the builder @rxap/plugin-localazy for a project:*

```
ng g @rxap/plugin-localazy:config [project]
```

> Adds the builder @rxap/pack-localazy:download and @rxap/pack-localazy:upload to the specified project

# Get started

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

# Schematics

## config

> Adds the builder @rxap/pack-localazy:download and @rxap/pack-localazy:upload to the specified project

```
ng g @rxap/plugin-localazy:config
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.
extractTarget | string |  | The target that extracts or generate the translation source file.

| Required |
| --- |
| project |

## ng-add
> Adds the localazy plugin to the workspace

```
ng g @rxap/plugin-localazy:ng-add
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | Name of the project.
extractTarget | string |  | The target that extracts or generate the translation source file.

# Builder

## download

> localazy download

**Builder name**

```
@rxap/plugin-localazy:download
```

Option | Type | Default | Description
--- | --- | --- | ---
readKey | string |  | Provide the writeKey on the command line.
writeKey | string |  | Provide the readkey on the command line.
keysJson | string |  | Override the keys file name.
configJson | string |  | Override the configuration file name.
workingDirectory | string |  | Set the working directory that all paths are relative to.
dryRun | boolean | false | Do not perform the actual operation, only simulate the process. No files are uploaded nor written.
quite | boolean | false | Quiet mode. Print only important information.
force | boolean | false | Force the upload operation if the validation step fails.
tag | string |  | Perform the operation for the given release tag.

## upload

> localazy upload

**Builder name**

```
@rxap/plugin-localazy:upload
```

Option | Type | Default | Description
--- | --- | --- | ---
readKey | string |  | Provide the writeKey on the command line.
writeKey | string |  | Provide the readkey on the command line.
keysJson | string |  | Override the keys file name.
configJson | string |  | Override the configuration file name.
workingDirectory | string |  | Set the working directory that all paths are relative to.
dryRun | boolean | false | Do not perform the actual operation, only simulate the process. No files are uploaded nor written.
quite | boolean | false | Quiet mode. Print only important information.
force | boolean | false | Force the upload operation if the validation step fails.
tag | string |  | Perform the operation for the given release tag.
extractTarget | string |  | The target that extracts or generate the translation source file.
