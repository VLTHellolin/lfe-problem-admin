import clsx from 'clsx';
import type React from 'react';

export interface LegacyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  theme?: 'primary' | 'error' | 'dark';
}

export const LegacyButton = ({ className, children, theme, ...props }: LegacyButtonProps) => {
  return (
    <button
      type='button'
      className={clsx('pa-button lfe-form-sz-middle', theme && `pa-${theme}`, className)}
      {...props}
    >
      {children}
    </button>
  );
};
