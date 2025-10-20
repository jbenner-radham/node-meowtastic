import type { Flag } from './types.js';

function quote(value: string): string {
  return `"${value}"`;
}

function getCommaSeparatedQuotedChoicesList(flag: Flag, conjunction: string) {
  if (!Array.isArray(flag.choices) || flag.choices.length === 0) {
    return '';
  }

  if (flag.choices.length === 1) {
    return quote(String(flag.choices.at(0)));
  }

  const quotedChoices = flag.choices.map(String).map(quote);
  const orPrefixedChoice = `${conjunction} ${quotedChoices.at(-1)}`;

  return [...quotedChoices.slice(0, -1), orPrefixedChoice].join(', ');
}

export function getCommaSeparatedQuotedChoicesOrList(flag: Flag): string {
  return getCommaSeparatedQuotedChoicesList(flag, 'or');
}
