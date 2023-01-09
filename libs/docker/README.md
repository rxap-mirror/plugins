@rxap/plugin-docker (Nx/Ng Plugin)
======

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-docker?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-docker)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-docker)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-docker)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-docker)

> 

- [Installation](#installation)
- [Schematics](#schematics)

# Installation

Add the plugin to your workspace:

```
ng add @rxap/plugin-docker
```

> Setup the package @rxap/plugin-docker for the workspace.


*Configure the builder @rxap/plugin-docker for a project:*

```
ng g @rxap/plugin-docker:config [project]
```

> Adds the @rxap/plugin-docker:build to the specified project

# Schematics

## config
> Adds the @rxap/plugin-docker:build to the specified project

```
ng g @rxap/plugin-docker:config
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.
context | string |  | Path to context for the docker build process.
dockerfile | string |  | Path to the dockerfile.
buildTarget | string |  | The target from witch the output path can be extract.
imageSuffix | string |  | A suffix added to the base image name
imageName | string |  | The base image name
imageRegistry | string |  | The image registry
command | string |  | The command to start docker
save | boolean |  | Whether to create a save target

| Required |
| --- |
| project |

## ng-add
> Setup the package @rxap/plugin-docker for the workspace.

```
ng g @rxap/plugin-docker:ng-add
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | Name of the project

