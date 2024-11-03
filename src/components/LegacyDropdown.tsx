import clsx from 'clsx';
import type React from 'react';
import { forwardRef } from 'react';

export interface LegacyDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  shown?: boolean;
}

export const LegacyDropdown = forwardRef<HTMLDivElement, LegacyDropdownProps>(
  ({ className, children, shown, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx('pa-dropdown', shown && 'shown', className)} {...props}>
        {children}
      </div>
    );
  }
);
