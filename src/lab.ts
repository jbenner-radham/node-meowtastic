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
    codeSpans: {
      description: 'Use `backticks` to format text.',
      shortFlag: 'c',
      type: 'boolean'
    }
  },
  importMeta: import.meta,
  packageOverrides: {
    bin: { meowtastic: 'path/to/bin' }
  },
  wrapText: false
};

meow(...getHelpTextAndOptions(config));
