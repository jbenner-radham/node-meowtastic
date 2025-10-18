import { getHelpText } from '../src/index.js';
import { describe, expect, it } from 'vitest';

describe('getHelpText', () => {
  it('is a function', () => {
    expect(getHelpText).toBeTypeOf('function');
  });
});
