import type { AttributifyAttributes } from '@unocss/preset-attributify';

declare module 'react' {
  // eslint-disable-next-line
  interface HTMLAttributes<T> extends AttributifyAttributes {}
}
