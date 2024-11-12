import clsx from 'clsx';
import type React from 'react';
import { forwardRef } from 'react';

export interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  primary?: boolean;
  error?: boolean;
  spacing?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, primary, error, spacing, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type='button'
        className={clsx(
          'pa-button solid lform-size-middle',
          primary && 'pa-primary',
          error && 'pa-error',
          spacing && 'pa-spacing',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
