import type { TextCaseThemeProperty } from './types.js';
import process from 'node:process';

export const INDENT_SPACES_COUNT = 2;

export const MAX_TERMINAL_COLUMNS_COUNT = 80;

// See: https://no-color.org/
export const NO_COLOR = Boolean(process.env.NO_COLOR);

export const OPTIONS_SECTION_SEPARATOR_SPACES_COUNT = 2;

export const TEXT_CASE_THEME_PROPERTIES: TextCaseThemeProperty[] = ['argument', 'header', 'option'];
