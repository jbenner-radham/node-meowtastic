meowtastic
==========

A helper library for [meow](https://www.npmjs.com/package/meow). Automatically create stylized help
text and more.

![Example of the meowtastic help text output.](images/example.png)

Features
--------

- Automatically styles Markdown code spans.
- Displays a usage example which can be customized.
- Lists all available flags in alphabetical order. Displays descriptions as well if specified.
- Is easily themeable.
- Provides optional descriptions and short flags for the `help` and `version` flags.
- Supports the [`NO_COLOR`](https://no-color.org/) environment variable standard.

Install
-------

...

Usage
-----

```typescript
import meow from 'meow';
import {
  type AnyFlagsWithDescriptions,
  type Config,
  getHelpAndVersionFlags,
  getHelpText
} from 'meowtastic';

const flags: AnyFlagsWithDescriptions = {
  ...getHelpAndVersionFlags(), // <- Add a description and short flag to `help` and `version`.
  example: {
    description: 'An example... yeah!',
    shortFlag: 'e',
    type: 'string'
  },
  yolo: {
    description: 'Do something or invoke `yolo` or something else... Invoke `idk`?',
    shortFlag: 'y',
    type: 'boolean'
  }
};

const config: Config = {
  flags,
  importMeta: import.meta,
  includeDescription: true,
  packageOverrides: {
    bin: { meowtastic: 'path/to/bin' }
  }
};

meow(
  getHelpText(config),
  {
    description: false,
    flags,
    importMeta: import.meta
  }
);
```

Prior Art
---------

- [cli-meow-help](https://www.npmjs.com/package/cli-meow-help)
- [meow-helper](https://www.npmjs.com/package/meow-helper)

License
-------

The BSD 3-Clause License. See the [license file](LICENSE) for details.
