import { INDENT_SPACES_COUNT, MAX_COLUMNS_COUNT } from './constants.js';
import formatArgument from './format-argument.js';
import styleCodeSpans from './style-code-spans.js';
import type { Argument, ColumnSpacing, Commands, Styler } from './types.js';
import { getTextLength, wrapTextIntoLines } from './wrap-text.js';
import { EOL } from 'node:os';

function getCommandSpacing({
  columnWidth,
  command,
  arguments: args
}: {
  columnWidth: number;
  command: string;
  arguments?: Argument[];
}): ColumnSpacing {
  const start = INDENT_SPACES_COUNT;
  const commandLength = args?.length
    ? getCommandUnstyledString(command, { arguments: args }).length
    : getCommandUnstyledString(command, {}).length;
  const end = columnWidth - (start + commandLength);

  return { start, end };
}

function getCommandStyledString(
  command: string,
  {
    arguments: args,
    styler
  }: {
    arguments?: Argument[];
    styler: Styler;
  }
): string {
  return (
    styler.command(command) +
    (args?.length
      ? ` ${args.map(argument => formatArgument(argument, { styler })).join(' ')}`
      : '')
  );
}

function getCommandUnstyledString(
  command: string,
  { arguments: args }: { arguments?: Argument[] }
): string {
  return (
    command +
    (args?.length
      ? ` ${args.map(argument => formatArgument(argument)).join(' ')}`
      : '')
  );
}

function getLongestCommandLength(commands: Commands): number {
  return Math.max(
    ...Object.entries(commands).map(
      ([command, meta]) => getTextLength(getCommandUnstyledString(command, meta))
    )
  );
}

function getCommandColumn({
  columnWidth,
  command,
  arguments: args,
  styler
}: {
  columnWidth: number;
  command: string;
  arguments?: Argument[];
  styler: Styler;
}) {
  const spacing = getCommandSpacing({ columnWidth, command, arguments: args ?? [] });

  return (
    ' '.repeat(spacing.start) +
    getCommandStyledString(command, { arguments: args ?? [], styler }) +
    ' '.repeat(spacing.end)
  );
}

function getCommandLines({
  arguments: args,
  command,
  commandColumnWidth,
  description,
  descriptionColumnWidth,
  styler,
  wrapText
}: {
  arguments?: Argument[];
  command: string;
  commandColumnWidth: number;
  description?: string;
  descriptionColumnWidth: number;
  styler: Styler;
  wrapText: boolean;
}): string[] {
  const commandLine =
    getCommandColumn({ arguments: args ?? [], columnWidth: commandColumnWidth, command, styler });
  const descriptionColumn = wrapText
    ? wrapTextIntoLines({ text: description ?? '', columnWidth: descriptionColumnWidth })
    : [description ?? ''];
  const commandColumn = [
    commandLine,
    ...Array.from({ length: descriptionColumn.length - 1 }, () => ' '.repeat(commandColumnWidth))
  ];

  return commandColumn.map((commandLine, index) => {
    const descriptionLine = descriptionColumn.at(index)!;

    return `${commandLine}${styleCodeSpans(descriptionLine, styler)}`;
  });
}

export function getCommandsBody({
  commands,
  styler,
  wrapText
}: {
  commands: Commands;
  styler: Styler;
  wrapText: boolean;
}): string {
  const longestCommandLength = getLongestCommandLength(commands);
  const commandColumnWidth = INDENT_SPACES_COUNT + longestCommandLength + INDENT_SPACES_COUNT;
  const descriptionColumnWidth = MAX_COLUMNS_COUNT - commandColumnWidth;
  const lines = Object.entries(commands)
    .sort((a, b) =>
      (a.at(0) as string).localeCompare(b.at(0) as string))
    .reduce((accumulator, [command, meta]) => {
      const lines = getCommandLines({
        arguments: meta.arguments ?? [],
        command,
        commandColumnWidth,
        description: meta.description ?? '',
        descriptionColumnWidth,
        styler,
        wrapText
      });

      return [...accumulator, ...lines];
    }, [] as string[]);

  return lines.join(EOL);
}
