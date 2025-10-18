import { getHelpAndVersionFlags, getHelpText } from './index.js';
import meow from 'meow';

const descriptions = {
  flags: {
    help: 'Display this message.',
    version: 'Display the application version.'
  }
};
const flags = getHelpAndVersionFlags();

meow(
  getHelpText({ descriptions, flags, importMeta: import.meta }),
  {
    description: false,
    flags,
    importMeta: import.meta
  }
);
