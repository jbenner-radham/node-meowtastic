import { getPackageBin, getPackageDescription } from './package.js';
import chalkPipe from 'chalk-pipe';
import decamelizeKeys from 'decamelize-keys';
import type { Flag } from 'meow';
import { EOL } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { readPackageUpSync } from 'read-package-up';
import type { PackageJson } from 'type-fest';

// These aren't exported from `meow` for whatever reason. So I just copy/pasted them here.
// From: https://tinyurl.com/7apyy7bk
export type StringFlag = Flag<'string', string> | Flag<'string', string[], true>;
export type BooleanFlag = Flag<'boolean', boolean> | Flag<'boolean', boolean[], true>;
export type NumberFlag = Flag<'number', number> | Flag<'number', number[], true>;
export type AnyFlag = StringFlag | BooleanFlag | NumberFlag;
export type AnyFlags = Record<string, AnyFlag>;

export type AnyFlagWithDescription = AnyFlag & { description: string };
export type AnyFlagsWithDescriptions = Record<string, AnyFlagWithDescription>;

export type Config = {
  flags?: AnyFlagsWithDescriptions;
  importMeta: ImportMeta;
  includeDescription?: boolean;
  packageOverride?: PackageJson;
};

export type TextCase = 'lower' | 'title' | 'upper';

export type Theme = {
  arguments?: string | [string, TextCase];
  bin?: string;
  code?: string;
  flag?: string;
  header?: string | [string, TextCase];
  options?: string | [string, TextCase];
  promptSymbol?: string;
};

export type TextCaseThemeProperty = keyof Pick<Theme, 'arguments' | 'header' | 'options'>;

// See: https://no-color.org/
const NO_COLOR = Boolean(process.env.NO_COLOR);

export function getHelpAndVersionFlags(): AnyFlagsWithDescriptions {
  return {
    help: {
      description: 'Display this message.',
      shortFlag: 'h',
      type: 'boolean'
    },
    version: {
      description: 'Display the application version.',
      shortFlag: 'v',
      type: 'boolean'
    }
  };
}

export function getDefaultHelpTextTheme(): Theme {
  return {
    arguments: ['', 'upper'],
    bin: 'bold',
    code: 'bold',
    flag: 'bold',
    header: ['bold', 'title'],
    options: ['dim', 'upper'],
    promptSymbol: 'dim'
  };
}

const TEXT_CASE_THEME_PROPERTIES: TextCaseThemeProperty[] = ['arguments', 'header', 'options'];

export function getHelpText(config: Config): string {
  const pkg = readPackageUpSync({
    cwd: path.dirname(fileURLToPath(config.importMeta.url)),
    normalize: false
  })?.packageJson ?? {};

  if (config.packageOverride) {
    Object.entries(config.packageOverride).forEach(([key, value]) => {
      pkg[key as keyof PackageJson] = value;
    });
  }

  const bin = getPackageBin(pkg);

  if (!bin) {
    throw new Error('Could not determine the name of the CLI app binary');
  }

  const theme = getDefaultHelpTextTheme();
  const styler = Object.entries(theme).reduce((accumulator, [key, value]) => {
    const supportsTextCasing = TEXT_CASE_THEME_PROPERTIES
      .includes(key as TextCaseThemeProperty);
    const textCase = supportsTextCasing && Array.isArray(value) && value.length === 2
      ? value.at(1)!
      : null;
    const style = Array.isArray(value) ? value.at(0)! : value;

    const compose = <T>(...functions: Array<(value: T) => T>) => {
      return (value: T) => functions.reduce((accumulator, fn) => fn(accumulator), value);
    };

    const transformTextCase = (text: string): string => {
      switch (textCase) {
        case 'lower':
          return text.toLowerCase();
        case 'upper':
          return text.toUpperCase();
        default:
          return text;
      }
    };

    return {
      ...accumulator,
      [key]: NO_COLOR || style === ''
        ? transformTextCase
        : compose(transformTextCase, chalkPipe(style))
    };
  }, {} as Record<keyof typeof theme, (value: string) => string>);

  const styleCodeSpans = (text: string): string => {
    return text.replaceAll(/`[^`]+`/g, match => styler.code(match.slice(1, -1)));
  };

  const { includeDescription = false } = config;
  const description = includeDescription ? styleCodeSpans(getPackageDescription(pkg)) : '';
  let optionsBody = '';

  if (!config.flags || Object.keys(config.flags).length === 0) {
    // #fffb68
    optionsBody = `
      ${styler.flag('--help')}     Display this message.
      ${styler.flag('--version')}  Display the application version.
    `.trim();
  } else {
    const flags = decamelizeKeys(config.flags, { separator: '-' });
    const flagList = Object.entries(flags)
      .sort((a, b) =>
        (a.at(0) as string).localeCompare(b.at(0) as string))
      .map(([name, meta]) => ({
        leftColumn: meta.shortFlag
          ? `${styler.flag('--' + name)}, ${styler.flag('-' + meta.shortFlag)}`
          : `${styler.flag('--' + name)}`,
        rightColumn: meta.description ? styleCodeSpans(meta.description) : ''
      }));
    const longestFlag = Math.max(...flagList.map(({ leftColumn }) => leftColumn.length));

    optionsBody = flagList.map(({ leftColumn, rightColumn }, index) =>
      index === 0
        ? leftColumn.padEnd(longestFlag) + '  ' + rightColumn
        : ' '.repeat(2) + leftColumn.padEnd(longestFlag) + '  ' + rightColumn
    ).join(EOL);
  }

  const helpLines = [
    styler.header('Usage'),
    `  ${styler.promptSymbol('$')} ${styler.bin(bin)} ${styler.options('[OPTIONS]')}`,
    '',
    styler.header('Options'),
    `  ${optionsBody}`
  ];

  if (includeDescription) {
    helpLines.unshift(description, '');
  }

  return helpLines.join(EOL);
}
