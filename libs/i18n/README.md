@rxap/plugin-i18n (Nx/Ng Plugin)
======

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-i18n?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-i18n)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-i18n)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-i18n)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-i18n)

> 

- [Installation](#installation)
- [Schematics](#schematics)
- [Builder](#builder)

# Installation

Add the plugin to your workspace:


  ```
  ng add @rxap/plugin-i18n
  ```

  *Adds the i18n plugin to the workspace*

Configure @rxap/plugin-i18n for a project:

```
ng g @rxap/plugin-i18n:config [project]
```

*Adds the @plugin-pack:build to the specified project*

# Schematics

**Adds the @plugin-pack:build to the specified project**

  ```
  ng g @rxap/plugin-i18n:config
  ```

Option | Type | Default | Description
  --- | --- | --- | ---
project | string |  | The name of the project.
availableLanguages | array |  |
assets | array |  |
defaultLanguage | string |  |

    | Required |
    | --- |
      | project |

**Adds the i18n plugin to the workspace**

  ```
  ng g @rxap/plugin-i18n:ng-add
  ```

Option | Type | Default | Description
  --- | --- | --- | ---
project | string |  | Name of the project.
availableLanguages | array |  |
assets | array |  |
defaultLanguage | string |  |

# Builder

**build builder**

  ```
  @rxap/plugin-i18n:build
  ```

Option | Type | Default | Description
  --- | --- | --- | ---
availableLanguages | array |  |
defaultLanguage | string |  |
assets | array |  | 



