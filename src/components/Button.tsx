import type React from 'react';
import { cva } from 'class-variance-authority';

export interface ButtonProps extends React.ComponentPropsWithRef<'button'> {
  theme?: 'primary' | 'error' | 'dark';
  spacing?: boolean;
  size?: 'middle' | 'small';
  disabled?: boolean;
}

const themeVariants = cva([], {
  variants: {
    theme: {
      default: 'border-#bfbfbf bg-white text-black',
      primary: 'border-primary bg-primary text-white',
      error: 'border-error bg-error text-white',
      dark: 'border-2 border-#ffffff80 bg-#00000080 text-white',
    },
    spacing: {
      false: null,
      true: 'px-1 py-4 mr-4',
    },
    size: {
      small: 'px-.5 py-2',
      middle: 'px-1.5 py-4',
    },
  },
  defaultVariants: {
    theme: 'default',
    spacing: false,
    size: 'middle',
  },
});

export const Button = ({ children, className, theme, spacing, size, ...props }: ButtonProps) => {
  return (
    <button
      type='button'
      inline-block
      cursor-pointer
      outline-0
      font-size-3
      mr-2
      line-height='1.5'
      border='1 solid #bfbfbf'
      hover:opacity='85'
      className={themeVariants({ theme, spacing, size, className })}
      {...props}
    >
      {children}
    </button>
  );
};
