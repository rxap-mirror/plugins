@rxap/plugin-localazy (Nx/Ng Plugin)
======

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-localazy?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-localazy)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-localazy)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-localazy)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-localazy)

> A Nx/Ng plugin for localazy.com upload and download tasks.

- [Installation](#installation)
- [Get started](#get-started)
- [Schematics](#schematics)
- [Builder](#builder)

# Installation

Add the plugin to your workspace:

```
ng add @rxap/plugin-localazy
```

> Setup the package @rxap/plugin-localazy for the workspace.


*Configure the builder @rxap/plugin-localazy for a project:*

```
ng g @rxap/plugin-localazy:config [project]
```

> Adds the builder @rxap/pack-localazy:download and @rxap/pack-localazy:upload to the specified project

# Get started

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
writeKey | string |  | The localazy write key.
readKey | string |  | The localazy read key.
overwrite | boolean | false | Whether to overwrite existing files.

| Required |
| --- |
| project |

## ng-add
> Setup the package @rxap/plugin-localazy for the workspace.

```
ng g @rxap/plugin-localazy:ng-add
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | Name of the project

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
autoTag | boolean | false | Automatically determine a tag and perform the operation for it.
tag | string |  | Perform the operation for the given release tag.
branch | string |  | Perform the operation for the given branch
param | string |  | Add extra parameter for processing; format is key:value
failOnMissingGroups | boolean |  | Fail when non-existent group is provided on the command line
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
autoTag | boolean | false | Automatically determine a tag and perform the operation for it.
extractTarget | string |  | The target that extracts or generate the translation source file.
disableContentLength | boolean |  | Disable Content-Length header when uploading data; use only when the upload  operation fails with &#x27;bad request&#x27;
async | boolean |  | Do not wait for the server to process the uploaded data and report errors.
project | string |  | Only perform upload if the project slug or ID match the specified one
branch | string |  | Perform the operation for the given branch
param | string |  | Add extra parameter for processing; format is key:value
failOnMissingGroups | boolean |  | Fail when non-existent group is provided on the command line
