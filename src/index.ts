import {
  INDENT_SPACES_COUNT,
  NO_COLOR,
  OPTIONS_SECTION_SEPARATOR_SPACES_COUNT,
  TEXT_CASE_THEME_PROPERTIES
} from './constants.js';
import defaultTheme from './default-theme.js';
import { getPackageBin, getPackageDescription } from './package.js';
import type {
  Argument,
  Config,
  Flag,
  Flags,
  TextCase,
  TextCaseThemeProperty,
  Theme
} from './types.js';
import chalkPipe from 'chalk-pipe';
import decamelize from 'decamelize';
import decamelizeKeys from 'decamelize-keys';
import type { Options } from 'meow';
import { EOL } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPackageUpSync } from 'read-package-up';
import type { PackageJson, Writable } from 'type-fest';

export type { Argument, Config, Flag, Flags, TextCase, TextCaseThemeProperty, Theme };

export function getDefaultHelpTextTheme(): Theme {
  return { ...defaultTheme };
}

export function getHelpAndVersionFlags(): Flags {
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

export function getHelpText(config: Config): string {
  const pkg = readPackageUpSync({
    cwd: path.dirname(fileURLToPath(config.importMeta.url)),
    normalize: false
  })?.packageJson ?? {};

  if (config.packageOverrides) {
    Object.entries(config.packageOverrides).forEach(([key, value]) => {
      pkg[key as keyof PackageJson] = value;
    });
  }

  const bin = getPackageBin(pkg);

  if (!bin) {
    throw new Error('Could not determine the name of the CLI app binary');
  }

  const theme = config.theme ?? getDefaultHelpTextTheme();
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
        case 'title':
          return decamelize(text, { separator: ' ' })
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
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
  }, {} as Record<keyof Theme, (value: string) => string>);

  const styleCodeSpans = (text: string): string => {
    return text.replaceAll(/`[^`]+`/g, match => styler.code(match.slice(1, -1)));
  };

  const getDescription = ({ description }: Config): string => {
    if (typeof description === 'string') {
      return styleCodeSpans(description);
    }

    if (typeof description === 'undefined') {
      return styleCodeSpans(getPackageDescription(pkg));
    }

    return '';
  };

  const { includeOptionsArgument = true } = config;
  const description = getDescription(config);

  let usageBody = ' '.repeat(INDENT_SPACES_COUNT) +
    `${styler.promptSymbol('$')} ${styler.bin(bin)}`;

  if (includeOptionsArgument) {
    usageBody += ` ${styler.option('[OPTIONS]')}`;
  }

  const args = config.arguments ?? [];

  if (args.length) {
    const formattedArguments = args.map(arg =>
      arg.required
        ? styler.argument(`<${arg.name}>`)
        : styler.option(`[${arg.name}]`)
    );
    usageBody += ` ${formattedArguments.join(' ')}`;
  }

  let optionsBody = '';

  if (!config.flags || Object.keys(config.flags).length === 0) {
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
    optionsBody = flagList.map(({ leftColumn, rightColumn }, index) => {
      return index === 0
        ? leftColumn.padEnd(longestFlag) +
          ' '.repeat(OPTIONS_SECTION_SEPARATOR_SPACES_COUNT) +
          rightColumn
        : ' '.repeat(INDENT_SPACES_COUNT) +
          leftColumn.padEnd(longestFlag) +
          ' '.repeat(OPTIONS_SECTION_SEPARATOR_SPACES_COUNT) +
          rightColumn;
    }).join(EOL);
  }

  const helpLines = [
    styler.header('Usage'),
    usageBody,
    '',
    styler.header('Options'),
    `  ${optionsBody}`
  ];

  if (description.length) {
    helpLines.unshift(description, '');
  }

  return helpLines.join(EOL);
}

export function getHelpTextAndOptions(config: Config): [string, Options<Flags>] {
  const { augmentHelpAndVersionFlags = true, description } = config;

  if (augmentHelpAndVersionFlags) {
    (config as Writable<Config>).flags = {
      ...getHelpAndVersionFlags(),
      ...config.flags
    };
  }

  const helpText = getHelpText(config);
  const keysNotInOptions = [
    'arguments', 'includeDescription', 'includeOptionsArgument', 'packageOverrides'
  ];
  const options = Object.entries(config).reduce((accumulator, [key, value]) => {
    if (!keysNotInOptions.includes(key)) {
      // @ts-expect-error The key type is valid, but I can't get TS to play nice with it.
      accumulator[key] = value;
    }

    return accumulator;
  }, (description !== false ? { description: false } : {}) as Options<Flags>);

  return [helpText, options];
}
