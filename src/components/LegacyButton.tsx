import clsx from 'clsx';
import type React from 'react';
import { forwardRef } from 'react';

export interface LegacyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  theme?: 'primary' | 'error' | 'dark';
}

export const LegacyButton = forwardRef<HTMLButtonElement, LegacyButtonProps>(
  ({ className, children, theme, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type='button'
        className={clsx('pa-button lfe-form-sz-middle', theme && `pa-${theme}`, className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
