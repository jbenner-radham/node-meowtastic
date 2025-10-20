import {
  INDENT_SPACES_COUNT,
  MAX_TERMINAL_COLUMNS_COUNT,
  NO_COLOR,
  OPTIONS_SECTION_SEPARATOR_SPACES_COUNT
} from './constants.js';
import { EOL } from 'node:os';

function getTextLength(text: string): number {
  const backtickCount = [...text].find(char => char === '`')?.length ?? 0;

  if (NO_COLOR || backtickCount % 2 !== 0) {
    return text.length + (backtickCount >= 3 ? backtickCount - 1 : 0);
  }

  return text.length - backtickCount;
}

export function wrapTextIfNeeded(
  text: string, { reservedCharCount = 0 }: { reservedCharCount?: number } = {}
): string {
  const totalInitialUsedCharsCount = reservedCharCount + getTextLength(text);

  if (totalInitialUsedCharsCount <= MAX_TERMINAL_COLUMNS_COUNT) {
    return text;
  }

  const words = text.split(' ');
  const buffer = [words];
  let currentLineIndex = 0;
  let nextLineIndex = 0;

  while (
    reservedCharCount + buffer.at(currentLineIndex)!.join(' ').length > MAX_TERMINAL_COLUMNS_COUNT
  ) {
    const word = buffer.at(currentLineIndex)!.pop()!;

    if (currentLineIndex === nextLineIndex) {
      nextLineIndex = currentLineIndex + 1;
    }

    if (!buffer.at(nextLineIndex)) {
      buffer.push([]);
    }

    buffer.at(nextLineIndex)!.push(word);

    if (
      reservedCharCount + buffer.at(currentLineIndex)!.join(' ').length <=
      MAX_TERMINAL_COLUMNS_COUNT
    ) {
      currentLineIndex = nextLineIndex;
    }
  }

  return buffer.map((line, index) => {
    return index === 0
      ? line.join(' ')
      : ' '.repeat(reservedCharCount) + line.join(' ');
  }).join(EOL);
}

export function wrapOptionsTextIfNeeded(longestFlagLength: number, text: string): string {
  const reservedCharCount = (
    longestFlagLength +
    INDENT_SPACES_COUNT +
    OPTIONS_SECTION_SEPARATOR_SPACES_COUNT
  );

  return wrapTextIfNeeded(text, { reservedCharCount });
}
