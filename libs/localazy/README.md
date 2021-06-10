@rxap/plugin-localazy (Nx/Ng Plugin)
======

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-localazy?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-localazy)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-localazy)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-localazy)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-localazy)

> A builder to execute a collection of architect targets in sequence.

- [Installation](#installation)
- [Schematics](#schematics)
- [Builder](#builder)

# Installation

Add the plugin to your workspace:


  ```
  ng add @rxap/plugin-localazy
  ```

  *Adds the localazy plugin to the workspace*


Configure @rxap/plugin-localazy for a project:

```
ng g @rxap/plugin-localazy:config [project]
```

*Adds the @plugin-pack:build to the specified project*

# Schematics


  **Adds the @plugin-pack:build to the specified project**

  ```
  ng g @rxap/plugin-localazy:config
  ```

  Option | Type | Default | Description
  --- | --- | --- | ---
    project | string |  | The name of the project.

    | Required |
    | --- |
      | project |


  **Adds the localazy plugin to the workspace**

  ```
  ng g @rxap/plugin-localazy:ng-add
  ```

  Option | Type | Default | Description
  --- | --- | --- | ---
    project | string |  | Name of the project.



# Builder


  **localazy download**

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


  **localazy upload**

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



