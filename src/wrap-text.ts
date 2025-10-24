import { NO_COLOR } from './constants.js';

export function getTextLength(text: string): number {
  const backtickCount = [...text].filter(char => char === '`').length;

  if (NO_COLOR) {
    return text.length;
  }

  if (backtickCount % 2 !== 0) {
    return backtickCount >= 3
      ? text.length - (backtickCount + 1)
      : text.length;
  }

  return text.length - backtickCount;
}

export function wrapTextIntoLines(
  { columnWidth, text }: { columnWidth: number; text: string }
): string[] {
  const words = text.split(' ');
  const lines = [];
  let buffer = '';

  words.forEach(word => {
    const maybeSpace = buffer ? ' ' : '';

    if (getTextLength(buffer + maybeSpace + word) <= columnWidth) {
      buffer += maybeSpace + word;
    } else {
      lines.push(buffer);
      buffer = word;
    }
  });

  if (buffer) {
    lines.push(buffer);
  }

  return lines;
}
