/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*.{js,ts,json,md}': 'eslint --fix',
  '*.png': files => files.map(file => `pngquant --force --output ${file} --skip-if-larger ${file}`),
  'package.json': 'sort-package-json'
};
