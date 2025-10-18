import chalk from 'chalk';
import decamelizeKeys from 'decamelize-keys';
import isPlainObject from 'is-plain-obj';
import type { Flag } from 'meow';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { readPackageUpSync } from 'read-package-up';
import type { PackageJson } from 'type-fest';

// import chalkPipe from 'chalk-pipe';

// From: https://github.com/sindresorhus/meow/blob/a691341b2f15fbb7cbd654de550871623dda0b40/source/index.d.ts#L108-L112
export type StringFlag = Flag<'string', string> | Flag<'string', string[], true>;
export type BooleanFlag = Flag<'boolean', boolean> | Flag<'boolean', boolean[], true>;
export type NumberFlag = Flag<'number', number> | Flag<'number', number[], true>;
export type AnyFlag = StringFlag | BooleanFlag | NumberFlag;
export type AnyFlags = Record<string, AnyFlag>;

export type Config = {
  descriptions?: {
    flags?: Record<string, string>;
  };
  flags?: AnyFlags;
  importMeta: ImportMeta;
};

// See: https://no-color.org/
const NO_COLOR = Boolean(process.env.NO_COLOR);

export function getPackageBin(pkg: PackageJson): string {
  const isScopedPackage = (name: string): boolean =>
    name.startsWith('@') &&
    name.slice(1, name.length - 1).includes('/');

  const getUnscopedPackageName = (name: string): string =>
    name.slice(name.indexOf('/') + 1);

  if (typeof pkg.bin === 'string' && typeof pkg.name === 'string') {
    if (isScopedPackage(pkg.name)) {
      return getUnscopedPackageName(pkg.name);
    }

    return pkg.name;
  } else if (isPlainObject(pkg.bin) && Object.keys(pkg.bin).length) {
    return Object.keys(pkg.bin).at(0)!;
  }

  return '';
}

export function getPackageDescription(pkg: PackageJson): string {
  if (!pkg.description) {
    return '';
  }

  if (NO_COLOR) {
    return pkg.description;
  }

  return pkg.description
    .replaceAll(/`[^`]+`/g, match => chalk.bold.white(match.slice(1, match.length - 1)));
}

export function getHelpAndVersionFlags(): Record<string, BooleanFlag> {
  return {
    help: {
      type: 'boolean',
      shortFlag: 'h'
    },
    version: {
      type: 'boolean',
      shortFlag: 'v'
    }
  };
}

export function getDefaultHelpTextTheme() {
  return {
    bin: 'bold',
    flag: '#00fd6a',
    header: 'bold.white', // Or 'bold.#66ecff'?! IDK?
    options: 'dim',
    promptSymbol: 'dim'
  };
}

export function getHelpText(config: Config): string {
  const pkg = readPackageUpSync({
    cwd: path.dirname(fileURLToPath(config.importMeta.url)),
    normalize: false
  })?.packageJson ?? {};

  pkg.bin = { meowtastic: 'path/dne' };

  const bin = getPackageBin(pkg);
  const description = getPackageDescription(pkg);
  const flagDescriptions = decamelizeKeys(config.descriptions?.flags ?? {}, { separator: '-' });

  if (!bin) {
    throw new Error('Could not determine the name of the CLI app binary');
  }

  // const passthrough = (value: string) => value;
  // const bold = NO_COLOR ? passthrough : chalk.bold;

  let optionsBody = '';

  if (!config.flags || Object.keys(config.flags).length === 0) {
    // #fffb68
    optionsBody = `
      ${chalk.hex('#00fd6a')('--help')}     Display this message.
      ${chalk.hex('#00fd6a')('--version')}  Display the application version.
    `.trim();
  } else {
    const flags = decamelizeKeys(config.flags, { separator: '-' });

    // const optionsList = [];
    // const longestFlag = Math.max(...Object.entries(flags).map(([name, meta]) => {
    //   return (meta.shortFlag ? `--${name}, -${meta.shortFlag}` : `--${name}`).length;
    // }));
    // const flagList = Object.entries(flags).map(([name, meta]) => {
    //   return (
    //     meta.shortFlag
    //       ? `${chalk.hex('#00fd6a')('--' + name)}, ${chalk.hex('#00fd6a')('-' + meta.shortFlag)}`
    //       : `${chalk.hex('#00fd6a')('--' + name)}`
    //   );
    // });

    // optionsBody = flagList.map((flag, index) =>
    //   index === 0 ? flag : ' '.repeat(6) + flag).join('\n');

    const flagList = Object.entries(flags).map(([name, meta]) => ({
      leftColumn: meta.shortFlag
        ? `${chalk.hex('#00fd6a')('--' + name)}, ${chalk.hex('#00fd6a')('-' + meta.shortFlag)}`
        : `${chalk.hex('#00fd6a')('--' + name)}`,
      rightColumn: flagDescriptions[name] ?? ''
    }));
    const longestFlag = Math.max(...flagList.map(({ leftColumn }) => leftColumn.length));

    // console.debug({ longestFlag, firstLength: flagList[0].leftColumn.length });
    optionsBody = flagList.map(({ leftColumn, rightColumn }, index) =>
      index === 0
        ? leftColumn.padEnd(longestFlag) + '  ' + rightColumn
        : ' '.repeat(6) + leftColumn.padEnd(longestFlag) + '  ' + rightColumn
    ).join('\n');

    // console.debug({ descriptions: flagDescriptions });
  }

  // return `
  //   ${chalk.bold.hex('#6BCB63')(bin)} [options]
  // `;
  return `
    ${description}

    ${chalk.bold.white('Usage')}
      ${chalk.dim('$')} ${chalk.bold.hex('#00fd6a')(bin)} ${chalk.dim('[OPTIONS]')}

    ${chalk.bold.hex('#66ecff')('Options')}
      ${optionsBody}
  `;
}
