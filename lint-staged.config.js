import os from 'node:os';

const IS_MAC = os.platform() === 'darwin';

/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*.{js,ts,json,md}': 'eslint --fix',
  '*.png': files => IS_MAC
    ? files.map(file => [`pngquant --force --output ${file} ${file}`, `imageoptim ${file}`])
    : files.map(file => `pngquant --force --output ${file} --skip-if-larger ${file}`),
  'package.json': 'sort-package-json'
};
