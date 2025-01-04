import clsx from 'clsx';
import type React from 'react';

export interface DropdownProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Dropdown = ({ className, children, ...props }: DropdownProps) => {
  return (
    <div className={clsx('pa-dropdown pa-fadein', className)} {...props}>
      {children}
    </div>
  );
};
