import type { Flag as MeowFlag, Options } from 'meow';
import type { PackageJson, Simplify, Writable } from 'type-fest';

// These aren't exported from `meow` for whatever reason. So I just copy/pasted them here.
// From: https://tinyurl.com/7apyy7bk
export type StringFlag = MeowFlag<'string', string> | MeowFlag<'string', string[], true>;
export type BooleanFlag = MeowFlag<'boolean', boolean> | MeowFlag<'boolean', boolean[], true>;
export type NumberFlag = MeowFlag<'number', number> | MeowFlag<'number', number[], true>;
export type AnyFlag = StringFlag | BooleanFlag | NumberFlag;
export type AnyFlags = Record<string, AnyFlag>;

export type Argument = { name: string; isRequired?: boolean };
export type Flag = Simplify<Writable<AnyFlag>> & { description?: string };
export type Flags = Record<string, Flag>;

export type OptionsFlagSpacing = {
  start: number;
  end: number;
};

export type Config = Writable<Options<Flags>> & {
  /**
   * The positional arguments of the app.
   */
  arguments?: Argument[];

  /**
   * Whether to add a description and short flag to the help and version flags.
   *
   * @default true
   */
  augmentHelpAndVersionFlags?: boolean;

  /**
   * Whether to include the `[OPTIONS]` argument in the usage section.
   *
   * @default true
   */
  includeOptionsArgument?: boolean;

  /**
   * Overrides for the `package.json` file.
   */
  packageOverrides?: PackageJson;

  /**
   * A theme to use for the help text.
   */
  theme?: Theme;

  /**
   * Whether to wrap text.
   *
   * @default true
   */
  wrapText?: boolean;
};

// All these cases are exactly like they sound, except for "title". It's a faux titlecase format
// in which the first letter of each word is capitalized.
export type TextCase = 'lower' | 'title' | 'upper';

// All the `string` types below can accept a string in the form of anything accepted by
// [chalk-pipe](https://www.npmjs.com/package/chalk-pipe) for formatting. Of note, if you do
// not want to use any styling, you can pass an empty string.
export type Theme = {
  // Required arguments displayed in the usage section.
  argument?: string | [string, TextCase];

  // The application binary's name.
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

export type Styler = Record<keyof Theme, (value: string) => string>;

export type TextCaseThemeProperty = keyof Pick<Theme, 'argument' | 'header' | 'option'>;
