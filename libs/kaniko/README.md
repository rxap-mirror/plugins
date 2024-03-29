@rxap/plugin-kaniko (Nx/Ng Plugin)
======

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-kaniko?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-kaniko)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-kaniko)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-kaniko)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-kaniko)

> 

- [Installation](#installation)
- [Schematics](#schematics)
- [Builder](#builder)

# Installation

Add the plugin to your workspace:

```
ng add @rxap/plugin-kaniko
```

> Setup the package @rxap/plugin-kaniko for the workspace.


*Configure the builder @rxap/plugin-kaniko for a project:*

```
ng g @rxap/plugin-kaniko:config [project]
```

> Adds the @rxap/plugin-kaniko:build to the specified project

# Schematics

## config
> Adds the @rxap/plugin-kaniko:build to the specified project

```
ng g @rxap/plugin-kaniko:config
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.
destination | array |  | Specify the docker image names
context | string |  | Path to context for the docker build process.
dockerfile | string |  | Path to the dockerfile.
buildTarget | string |  | The target from witch the output path can be extract.
command | string |  | The command to start kaniko
cache | boolean | true | Enable kaniko cache feature
latest | boolean | false | If true a destination with a latest tag is added

| Required |
| --- |
| project |

## ng-add
> Setup the package @rxap/plugin-kaniko for the workspace.

```
ng g @rxap/plugin-kaniko:ng-add
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | Name of the project

# Builder

## build
> build builder

**Builder name**
```
@rxap/plugin-kaniko:build
```

Option | Type | Default | Description
--- | --- | --- | ---
context | string |  | The docker build context path
dockerfile | string |  | The path to the dockerfile
destination | array |  | A list of docker image tags
buildTarget | string |  | The target from witch the output path can be extract.
imageSuffix | string |  | A suffix added to the base image name
command | string | /kaniko/executor | The command to start kaniko
cache | boolean | true | Enable kaniko cache feature
latest | boolean | false | If true a destination with a latest tag is added

| Required |
| --- |
| buildTarget |
