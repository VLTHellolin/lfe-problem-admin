import clsx from 'clsx';
import type React from 'react';

export interface LegacyDropdownProps extends React.HTMLAttributes<HTMLDivElement> {}

export const LegacyDropdown = ({ className, children, ...props }: LegacyDropdownProps) => {
  return (
    <div className={clsx('pa-dropdown pa-fadein', className)} {...props}>
      {children}
    </div>
  );
};
