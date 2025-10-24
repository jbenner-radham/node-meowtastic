import {
  INDENT_SPACES_COUNT,
  MAX_COLUMNS_COUNT,
  NO_COLOR,
  TEXT_CASE_THEME_PROPERTIES
} from './constants.js';
import defaultTheme from './default-theme.js';
import { getOptionsBody } from './options.js';
import { getPackageBin, getPackageDescription } from './package.js';
import styleCodeSpans from './style-code-spans.js';
import type {
  AnyFlags,
  Argument,
  Config,
  Flag,
  Flags,
  Styler,
  TextCase,
  TextCaseThemeProperty,
  Theme
} from './types.js';
import { wrapTextIntoLines } from './wrap-text.js';
import chalkPipe from 'chalk-pipe';
import decamelize from 'decamelize';
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
  const {
    arguments: args = [],
    includeOptionsArgument = true,
    packageOverrides,
    theme = getDefaultHelpTextTheme(),
    wrapText = true
  } = config;
  const pkg = readPackageUpSync({
    cwd: path.dirname(fileURLToPath(config.importMeta.url)),
    normalize: false
  })?.packageJson ?? {};

  if (packageOverrides) {
    Object.entries(packageOverrides).forEach(([key, value]) => {
      pkg[key as keyof PackageJson] = value;
    });
  }

  const bin = getPackageBin(pkg);

  if (!bin) {
    throw new Error('Could not determine the name of the CLI app binary');
  }

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
  }, {} as Styler);

  const getDescription = ({ description }: Config): string => {
    if (typeof description === 'string') {
      const lines = wrapText
        ? wrapTextIntoLines({ columnWidth: MAX_COLUMNS_COUNT, text: description })
        : [description];

      return lines.map(line => styleCodeSpans(line, styler)).join(EOL);
    }

    if (typeof description === 'undefined') {
      const lines = wrapText
        ? wrapTextIntoLines({ columnWidth: MAX_COLUMNS_COUNT, text: getPackageDescription(pkg) })
        : [getPackageDescription(pkg)];

      return lines.map(line => styleCodeSpans(line, styler)).join(EOL);
    }

    return '';
  };

  const description = getDescription(config);

  let usageBody = ' '.repeat(INDENT_SPACES_COUNT) +
    `${styler.promptSymbol('$')} ${styler.bin(bin)}`;

  if (includeOptionsArgument) {
    usageBody += ` ${styler.option('[OPTIONS]')}`;
  }

  if (args.length) {
    const formattedArguments = args.map(arg =>
      arg.isRequired
        ? styler.argument(`<${arg.name}>`)
        : styler.option(`[${arg.name}]`)
    );
    usageBody += ` ${formattedArguments.join(' ')}`;
  }

  const optionsBody = getOptionsBody({ flags: config.flags!, styler, wrapText });
  const helpLines = [
    styler.header('Usage'),
    usageBody,
    '',
    styler.header('Options'),
    optionsBody
  ];

  if (description.length) {
    helpLines.unshift(description, '');
  }

  return helpLines.join(EOL);
}

export function getHelpTextAndOptions(config: Config): [string, Options<AnyFlags>] {
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
    if (key === 'flags') {
      // Convert object from type `Flags` to `AnyFlags`.
      Object.values(value as Flags).forEach(flag => delete flag.description);
    }

    if (!keysNotInOptions.includes(key)) {
      // @ts-expect-error The key type is valid, but I can't get TS to play nice with it.
      accumulator[key] = value;
    }

    return accumulator;
  }, (description !== false ? { description: false } : {}) as Options<AnyFlags>);

  return [helpText, options];
}
