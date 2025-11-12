import type { Argument, Styler } from './types.js';

export default function formatArgument(
  argument: Argument,
  { styler }: { styler?: Styler } = {}
): string {
  if (styler) {
    return argument.isRequired
      ? styler.argument(`<${argument.name}>`)
      : styler.option(`[${argument.name}]`);
  }

  return argument.isRequired
    ? `<${argument.name}>`
    : `[${argument.name}]`;
}
