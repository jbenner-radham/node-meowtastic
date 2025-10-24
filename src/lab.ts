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
    },
    choices: {
      description: 'A list of choices. Options are %CHOICES_AND%.',
      shortFlag: 'C',
      type: 'string',
      choices: ['one', 'two', 'three']
    }
  },
  importMeta: import.meta,
  packageOverrides: {
    bin: { meowtastic: 'path/to/bin' }
  },
  wrapText: true
};

meow(...getHelpTextAndOptions(config));
