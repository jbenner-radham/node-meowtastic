import { type Config, getHelpTextAndOptions } from './index.js';
import meow from 'meow';

const config: Config = {
  arguments: [
    { name: 'file', isRequired: true },
    { name: 'additional files...' }
  ],
  flags: {
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
  },
  importMeta: import.meta,
  packageOverrides: {
    bin: { meowtastic: 'path/to/bin' }
  }
};

meow(...getHelpTextAndOptions(config));
