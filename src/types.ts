import type { Flag as MeowFlag } from 'meow';
import type { PackageJson, Simplify } from 'type-fest';

// These aren't exported from `meow` for whatever reason. So I just copy/pasted them here.
// From: https://tinyurl.com/7apyy7bk
type StringFlag = MeowFlag<'string', string> | MeowFlag<'string', string[], true>;
type BooleanFlag = MeowFlag<'boolean', boolean> | MeowFlag<'boolean', boolean[], true>;
type NumberFlag = MeowFlag<'number', number> | MeowFlag<'number', number[], true>;
type AnyFlag = StringFlag | BooleanFlag | NumberFlag;

export type Argument = { name: string; required?: boolean };
export type Flag = Simplify<AnyFlag> & { description: string };
export type Flags = Record<string, Flag>;

export type Config = {
  arguments?: Argument[];
  flags?: Flags;
  importMeta: ImportMeta;
  includeDescription?: boolean;
  includeOptionsArgument?: boolean;
  packageOverrides?: PackageJson;
};

// All these cases are exactly like they sound, except for "title". It's a faux titlecase format in
// which the first letter of each word is capitalized.
export type TextCase = 'lower' | 'title' | 'upper';

// All the `string` types below can accept a string in the form of anything accepted by
// [chalk-pipe](https://www.npmjs.com/package/chalk-pipe) for formatting. Of note, if you do not
// want to use any styling, you can pass an empty string.
export type Theme = {
  // Required arguments displayed in the usage section.
  argument?: string | [string, TextCase];

  // The application's binary name.
  bin?: string;

  // Markdown code spans in the app description or flag descriptions.
  code?: string;

  // Flags displayed in the options section.
  flag?: string;

  // Section headers such as "Usage" and "Options".
  header?: string | [string, TextCase];

  // Optional arguments displayed in the usage section.
  option?: string | [string, TextCase];

  // The shell prompt symbol ("$") used in the usage section.
  promptSymbol?: string;
};

export type TextCaseThemeProperty = keyof Pick<Theme, 'argument' | 'header' | 'option'>;
