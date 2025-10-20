import type { Theme } from './index.js';

export default {
  argument: ['', 'upper'],
  bin: 'bold',
  code: 'bold',
  flag: 'bold',
  header: ['bold', 'title'],
  option: ['', 'upper'],
  promptSymbol: 'dim'
} as const satisfies Theme;
