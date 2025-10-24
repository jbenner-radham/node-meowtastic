import type { Styler } from './types.js';

export default function styleCodeSpans(text: string, styler: Styler): string {
  return text.replaceAll(/`[^`]+`/g, match => styler.code(match.slice(1, -1)));
}
