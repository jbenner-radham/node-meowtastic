import {
  type AnyFlagsWithDescriptions,
  type Config,
  getHelpAndVersionFlags,
  getHelpText
} from './index.js';
import meow from 'meow';

const flags: AnyFlagsWithDescriptions = {
  ...getHelpAndVersionFlags(),
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
  packageOverride: {
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
