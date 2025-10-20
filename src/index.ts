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
import { EOL } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPackageUpSync } from 'read-package-up';
import type { PackageJson } from 'type-fest';

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

  const { includeDescription = false } = config;
  const description = includeDescription ? styleCodeSpans(getPackageDescription(pkg)) : '';

  let usageBody = ' '.repeat(INDENT_SPACES_COUNT) +
    `${styler.promptSymbol('$')} ${styler.bin(bin)} ${styler.option('[OPTIONS]')}`;

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

    // const longestFlagLength = Math.max(
    //   ...Object.entries(flags).map(([name, meta]) =>
    //     meta.shortFlag
    //       ? `--${name}, -${meta.shortFlag}`.length
    //       : `--${name}`.length
    //   )
    // );
    // console.debug({ flags });
    // const flagList = Object.entries(flags)
    //   .sort((a, b) =>
    //     (a.at(0) as string).localeCompare(b.at(0) as string))
    //   .map(([name, meta]) => {
    //     const pattern = /^(?<flag>--[^, ]+)(?:, (?<shortFlag>-[^ ]+))? {2,}(?<description>.+)/;
    //     // console.debug({ shortFlag: meta.shortFlag });
    //     // const text = wrapOptionsTextIfNeeded(
    //     //   longestFlagLength,
    //   `--${name}${meta.shortFlag ? `, -${meta.shortFlag}` : ''}`.padEnd(longestFlagLength) +
    //   ' '.repeat(OPTIONS_SECTION_SEPARATOR_SPACES_COUNT) +
    //     //   `${meta.description ?? ''}`
    //     // );
    //     const text = wrapOptionsTextIfNeeded(
    //       longestFlagLength,
    //       meta.shortFlag
    //         ? `--${name}, -${meta.shortFlag}`.padEnd(longestFlagLength) +
    //           ' '.repeat(OPTIONS_SECTION_SEPARATOR_SPACES_COUNT) +
    //           (meta.description ?? '')
    //         : `--${name}`.padEnd(longestFlagLength) +
    //           ' '.repeat(OPTIONS_SECTION_SEPARATOR_SPACES_COUNT) +
    //           (meta.description ?? '')
    //     );
    //     // console.debug(typeof meta.description);
    //     // console.debug(text);
    //     const { flag, shortFlag, description } = pattern.exec(text)?.groups ?? {};
    //     // console.debug({ flag, shortFlag, description });
    //     // console.debug({ description });
    //     // console.debug({ flag, styledFlag: styler.flag(flag!) });
    //     // console.log(styler.flag(flag!));
    //     const firstLine = shortFlag
    //       // eslint-disable-next-line @stylistic/multiline-ternary
    //       ? `${styler.flag(flag!)}, ${styler.flag(shortFlag)}`.padEnd(longestFlagLength) +
    //         ' '.repeat(OPTIONS_SECTION_SEPARATOR_SPACES_COUNT) +
    //         // eslint-disable-next-line @stylistic/multiline-ternary
    //         // description ? styleCodeSpans(description!) : ''
    //         (description ?? '')
    //       // eslint-disable-next-line @stylistic/multiline-ternary
    //       : `${styler.flag(flag!)}`.padEnd(longestFlagLength) +
    //         ' '.repeat(OPTIONS_SECTION_SEPARATOR_SPACES_COUNT) +
    //         // eslint-disable-next-line @stylistic/multiline-ternary
    //         // description ? styleCodeSpans(description!) : '';
    //         (description ?? '');
    //
    //     // return firstLine;
    //     return [firstLine, ...text.split(EOL).slice(1)].join(EOL);
    //     // return text.split(EOL);
    //     // return text;
    //     // return {
    //     //   leftColumn: meta.shortFlag
    //     //     ? `${styler.flag('--' + name)}, ${styler.flag('-' + meta.shortFlag)}`
    //     //     : `${styler.flag('--' + name)}`,
    //     //   rightColumn: meta.description ? styleCodeSpans(meta.description) : ''
    //     // };
    //   });

    // console.debug(flagList);
    // optionsBody = flagList.map((flag, index) => {
    //   return index === 0
    //     ? flag
    //     : ' '.repeat(INDENT_SPACES_COUNT) + flag;
    // }).join(EOL);

    // optionsBody = flagList.map(({ leftColumn, rightColumn }, index) =>
    //   wrapOptionsTextIfNeeded(
    //     longestFlagVisibleLength,
    //     index === 0
    //       ? leftColumn.padEnd(longestFlag) + '  ' + rightColumn
    //       : ' '.repeat(2) + leftColumn.padEnd(longestFlag) + '  ' + rightColumn
    //   )
    // ).join(EOL);
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

  if (includeDescription) {
    helpLines.unshift(description, '');
  }

  return helpLines.join(EOL);
}
