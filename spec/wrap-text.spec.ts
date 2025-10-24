import { wrapTextIntoLines } from '../src/wrap-text.js';
import { describe, expect, it } from 'vitest';

describe('wrapTextIntoLines', () => {
  it('is a function', () => {
    expect(wrapTextIntoLines).toBeTypeOf('function');
  });

  it('returns an array', () => {
    expect(Array.isArray(wrapTextIntoLines({ columnWidth: 80, text: 'foo bar' }))).toBe(true);
  });

  it('wraps text into lines', () => {
    const text = 'Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex' +
      ' sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis' +
      ' tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus' +
      ' bibendum egestas iaculis massa nisl malesuada lacinia.';
    const actual = wrapTextIntoLines({ columnWidth: 50, text });
    const expected = [
      'Lorem ipsum dolor sit amet consectetur adipiscing',
      'elit quisque faucibus ex sapien vitae pellentesque',
      'sem placerat in id cursus mi pretium tellus duis',
      'convallis tempus leo eu aenean sed diam urna',
      'tempor pulvinar vivamus fringilla lacus nec metus',
      'bibendum egestas iaculis massa nisl malesuada',
      'lacinia.'
    ];

    expect(actual).toEqual(expected);
  });

  it('does not wrap text which does not exceed the column width', () => {
    const text = 'Lorem ipsum dolor sit amet consectetur adipiscing elit.';
    const actual = wrapTextIntoLines({ columnWidth: 55, text });
    const expected = ['Lorem ipsum dolor sit amet consectetur adipiscing elit.'];

    expect(actual).toEqual(expected);
  });
});
