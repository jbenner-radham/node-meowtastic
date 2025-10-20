import { getCommaSeparatedQuotedChoicesOrList } from '../src/lists.js';
import type { Flag } from '../src/types.js';
import { describe, expect, it } from 'vitest';

describe('getCommaSeparatedQuotedChoicesOrList', () => {
  it('is a function', () => {
    expect(getCommaSeparatedQuotedChoicesOrList).toBeTypeOf('function');
  });

  it('returns a string', () => {
    const flag: Flag = { choices: ['foo', 'bar', 'baz'], type: 'string' };

    expect(getCommaSeparatedQuotedChoicesOrList(flag)).toBeTypeOf('string');
  });

  it('returns a list of choices with an "or" before the last item', () => {
    const flag: Flag = { choices: ['foo', 'bar', 'baz'], type: 'string' };
    const actual = getCommaSeparatedQuotedChoicesOrList(flag);
    const expected = '"foo", "bar", or "baz"';

    expect(actual).toEqual(expected);
  });

  it('returns a single quoted item if only one choice is present', () => {
    const flag: Flag = { choices: ['foo'], type: 'string' };

    expect(getCommaSeparatedQuotedChoicesOrList(flag)).toEqual('"foo"');
  });
});
