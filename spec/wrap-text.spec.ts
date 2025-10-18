import {
  MAX_TERMINAL_COLUMNS_COUNT, OPTIONS_SECTION_INDENT_SPACES_COUNT,
  OPTIONS_SECTION_SEPARATOR_SPACES_COUNT
} from '../src';
import { wrapOptionsTextIfNeeded, wrapTextIfNeeded } from '../src/wrap-text.js';
import { EOL } from 'node:os';
import { describe, expect, it } from 'vitest';

describe('wrapTextIfNeeded', () => {
  it('is a function', () => {
    expect(wrapTextIfNeeded).toBeTypeOf('function');
  });

  it('returns a string', () => {
    expect(wrapTextIfNeeded('')).toBeTypeOf('string');
  });

  it('wraps text that exceeds the maximum width into two lines', () => {
    const lorem = 'Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex' +
      ' sapien vitae pellentesque sem.';
    const wrapped = wrapTextIfNeeded(lorem);
    const maxLength = Math.max(...wrapped.split(EOL).map(line => line.length));

    expect(maxLength).toBeLessThanOrEqual(MAX_TERMINAL_COLUMNS_COUNT);
  });

  it('wraps text that exceeds the maximum width into three lines', () => {
    const lorem = 'Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex' +
      ' sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis' +
      ' tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus' +
      ' bibendum egestas iaculis massa nisl malesuada lacinia.';
    const wrapped = wrapTextIfNeeded(lorem);
    const maxLength = Math.max(...wrapped.split(EOL).map(line => line.length));

    expect(maxLength).toBeLessThanOrEqual(MAX_TERMINAL_COLUMNS_COUNT);
  });
});

describe('wrapOptionsTextIfNeeded', () => {
  it('is a function', () => {
    expect(wrapOptionsTextIfNeeded).toBeTypeOf('function');
  });

  it('returns a string', () => {
    expect(wrapOptionsTextIfNeeded(10, '')).toBeTypeOf('string');
  });

  it('wraps text that exceeds the maximum width into two lines', () => {
    const flag = '--example, -e';
    const longestFlagLength = flag.length;
    const lorem = 'Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex' +
      ' sapien vitae pellentesque sem.';
    const text = ' '.repeat(OPTIONS_SECTION_INDENT_SPACES_COUNT) +
      flag +
      ' '.repeat(OPTIONS_SECTION_SEPARATOR_SPACES_COUNT) +
      lorem;
    const wrapped = wrapOptionsTextIfNeeded(longestFlagLength, text);
    const maxLength = Math.max(...wrapped.split(EOL).map(line => line.length));

    expect(maxLength).toBeLessThanOrEqual(MAX_TERMINAL_COLUMNS_COUNT);
  });

  it('wraps text that exceeds the maximum width into six lines', () => {
    const flag = '--example, -e';
    const longestFlagLength = flag.length;
    const lorem = 'Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex' +
      ' sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis' +
      ' tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus' +
      ' bibendum egestas iaculis massa nisl malesuada lacinia.';
    const text = ' '.repeat(OPTIONS_SECTION_INDENT_SPACES_COUNT) +
      flag +
      ' '.repeat(OPTIONS_SECTION_SEPARATOR_SPACES_COUNT) +
      lorem;
    const wrapped = wrapOptionsTextIfNeeded(longestFlagLength, text);
    const maxLength = Math.max(...wrapped.split(EOL).map(line => line.length));
    console.debug(wrapped);
    expect(maxLength).toBeLessThanOrEqual(MAX_TERMINAL_COLUMNS_COUNT);
  });
});
