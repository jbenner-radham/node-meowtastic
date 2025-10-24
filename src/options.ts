import {
  DEFAULT_VARIABLE,
  FLAG_CHOICES_AND_LIST_VARIABLE,
  FLAG_CHOICES_OR_LIST_VARIABLE,
  INDENT_SPACES_COUNT,
  MAX_COLUMNS_COUNT,
  OPTIONS_SECTION_INNER_PADDING_SPACES_COUNT
} from './constants.js';
import { getHelpAndVersionFlags } from './index.js';
import {
  getCommaSeparatedQuotedChoicesAndList,
  getCommaSeparatedQuotedChoicesOrList
} from './lists.js';
import styleCodeSpans from './style-code-spans.js';
import type { Flag, Flags, OptionsFlagSpacing, Styler } from './types.js';
import { wrapTextIntoLines } from './wrap-text.js';
import decamelizeKeys from 'decamelize-keys';
import { EOL } from 'node:os';

function getOptionsFlagStyledString(name: string, flag: Flag, styler: Styler): string {
  return styler.flag(`--${name}`) + styler.flag(flag.shortFlag ? `, -${flag.shortFlag}` : '');
}

function getOptionsFlagUnstyledString(name: string, flag: Flag): string {
  return `--${name}` + (flag.shortFlag ? `, -${flag.shortFlag}` : '');
}

function getOptionsFlagSpacing({ columnWidth, flag, name }: {
  columnWidth: number; flag: Flag; name: string;
}): OptionsFlagSpacing {
  const start = INDENT_SPACES_COUNT;
  const end = columnWidth - (start + getOptionsFlagUnstyledString(name, flag).length);

  return { start, end };
}

function getLongestFlagLength(flags: Flags): number {
  return Math.max(...Object.entries(flags).map(([name, flag]) =>
    getOptionsFlagUnstyledString(name, flag).length)
  );
}

function getOptionsFlagColumn({
  name,
  flag,
  styler,
  columnWidth
}: {
  name: string;
  flag: Flag;
  styler: Styler;
  columnWidth: number;
}) {
  const spacing = getOptionsFlagSpacing({ columnWidth, flag, name });

  return (
    ' '.repeat(spacing.start) +
    getOptionsFlagStyledString(name, flag, styler) +
    ' '.repeat(spacing.end)
  );
}

function maybeTransformOptionDescription(flag: Flag): string {
  let buffer = [...flag.description ?? ''].join('');

  if (buffer.includes(DEFAULT_VARIABLE)) {
    const quote = (value: unknown) =>
      typeof value === 'string' ? `"${value}"` : '`' + String(value) + '`';
    buffer = buffer.replaceAll(DEFAULT_VARIABLE, flag.default ? quote(flag.default) : '');
  }

  if (buffer.includes(FLAG_CHOICES_AND_LIST_VARIABLE)) {
    buffer = buffer.replaceAll(
      FLAG_CHOICES_AND_LIST_VARIABLE,
      getCommaSeparatedQuotedChoicesAndList(flag)
    );
  }

  if (buffer.includes(FLAG_CHOICES_OR_LIST_VARIABLE)) {
    buffer = buffer.replaceAll(
      FLAG_CHOICES_OR_LIST_VARIABLE,
      getCommaSeparatedQuotedChoicesOrList(flag)
    );
  }

  return buffer;
}

function getOptionsFlagLines({
  name,
  flag,
  flagColumnWidth,
  descriptionColumnWidth,
  styler,
  wrapText
}: {
  name: string;
  flag: Flag;
  flagColumnWidth: number;
  descriptionColumnWidth: number;
  styler: Styler;
  wrapText: boolean;
}) {
  const flagLine = getOptionsFlagColumn({ name, flag, columnWidth: flagColumnWidth, styler });
  const description = maybeTransformOptionDescription(flag);
  const descriptionColumn = wrapText
    ? wrapTextIntoLines({ text: description, columnWidth: descriptionColumnWidth })
    : [description];
  const flagColumn = [
    flagLine,
    ...Array.from({ length: descriptionColumn.length - 1 }, () => ' '.repeat(flagColumnWidth))
  ];

  return flagColumn.map((flagLine, index) => {
    const descriptionLine = descriptionColumn[index]!;

    return `${flagLine}${styleCodeSpans(descriptionLine, styler)}`;
  });
}

export function getOptionsBody({
  flags,
  styler,
  wrapText
}: {
  flags: Flags;
  styler: Styler;
  wrapText: boolean;
}): string {
  const defaultFlags = getHelpAndVersionFlags();

  delete defaultFlags.help!.shortFlag;
  delete defaultFlags.version!.shortFlag;

  const normalizedFlags = decamelizeKeys(flags ?? defaultFlags, { separator: '-' });
  const longestFlagLength = getLongestFlagLength(normalizedFlags);
  const flagColumnWidth =
    INDENT_SPACES_COUNT + longestFlagLength + OPTIONS_SECTION_INNER_PADDING_SPACES_COUNT;
  const descriptionColumnWidth = MAX_COLUMNS_COUNT - flagColumnWidth;
  const lines = Object.entries(normalizedFlags)
    .sort((a, b) =>
      (a.at(0) as string).localeCompare(b.at(0) as string))
    .reduce((accumulator, [name, flag]) => {
      const lines = getOptionsFlagLines({
        name,
        flag,
        flagColumnWidth,
        descriptionColumnWidth,
        styler,
        wrapText
      });

      return [...accumulator, ...lines];
    }, [] as string[]);

  return lines.join(EOL);
}
