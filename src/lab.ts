import {
  type AnyFlagsWithDescriptions,
  type Config,
  getHelpAndVersionFlags,
  getHelpText
} from './index.js';
import meow from 'meow';

const flags: AnyFlagsWithDescriptions = {
  ...getHelpAndVersionFlags(),
  yolo: {
    description: 'Do something or invoke `yolo` or something else... Invoke `idk`?',
    type: 'boolean',
    shortFlag: 'y'
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
