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
export type TextCase = 'lower' | 'title' | 'upper';

export type Config = {
  arguments?: Argument[];
  flags?: Flags;
  importMeta: ImportMeta;
  includeDescription?: boolean;
  packageOverrides?: PackageJson;
};

export type Theme = {
  argument?: string | [string, TextCase];
  bin?: string;
  code?: string;
  flag?: string;
  header?: string | [string, TextCase];
  option?: string | [string, TextCase];
  promptSymbol?: string;
};

export type TextCaseThemeProperty = keyof Pick<Theme, 'argument' | 'header' | 'option'>;
