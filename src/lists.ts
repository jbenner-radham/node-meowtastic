import type { Flag } from './types.js';

function maybeQuote(value: unknown): string {
  return typeof value === 'string'
    ? `"${value}"`
    : String(value);
}

function getCommaSeparatedQuotedChoicesList(flag: Flag, conjunction: string): string {
  if (!Array.isArray(flag.choices) || flag.choices.length === 0) {
    return '';
  }

  if (flag.choices.length === 1) {
    return maybeQuote(String(flag.choices.at(0)));
  }

  const quotedChoices = flag.choices.map(maybeQuote);

  if (flag.choices.length === 2) {
    return quotedChoices.join(` ${conjunction} `);
  }

  const conjunctionPrefixedChoice = `${conjunction} ${quotedChoices.at(-1)}`;

  return [...quotedChoices.slice(0, -1), conjunctionPrefixedChoice].join(', ');
}

export function getCommaSeparatedQuotedChoicesAndList(flag: Flag): string {
  return getCommaSeparatedQuotedChoicesList(flag, 'and');
}

export function getCommaSeparatedQuotedChoicesOrList(flag: Flag): string {
  return getCommaSeparatedQuotedChoicesList(flag, 'or');
}
