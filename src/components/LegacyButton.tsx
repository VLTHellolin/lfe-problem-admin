import clsx from 'clsx';
import type React from 'react';
import { forwardRef } from 'react';

export interface LegacyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  primary?: boolean;
}

export const LegacyButton = forwardRef<HTMLButtonElement, LegacyButtonProps>(
  ({ className, children, primary, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type='button'
        className={clsx(
          'pa-button lfe-form-sz-middle',
          primary ? 'pa-primary' : 'pa-secondary',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
