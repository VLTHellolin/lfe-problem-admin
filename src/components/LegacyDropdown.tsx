import clsx from 'clsx';
import type React from 'react';
import { forwardRef } from 'react';

export interface LegacyDropdownProps extends React.HTMLAttributes<HTMLDivElement> {}

export const LegacyDropdown = forwardRef<HTMLDivElement, LegacyDropdownProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx('pa-dropdown pa-fadein', className)} {...props}>
        {children}
      </div>
    );
  }
);
