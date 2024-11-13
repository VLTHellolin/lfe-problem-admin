import clsx from 'clsx';
import type React from 'react';

export interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  theme?: 'primary' | 'error' | 'dark';
  spacing?: boolean;
  size?: 'middle' | 'small';
}

export const Button = ({ className, children, theme, spacing, size, ...props }: ButtonProps) => {
  return (
    <button
      type='button'
      className={clsx(
        `pa-button solid lform-size-${size ?? 'middle'}`,
        theme && `pa-${theme}`,
        spacing && 'pa-spacing',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
