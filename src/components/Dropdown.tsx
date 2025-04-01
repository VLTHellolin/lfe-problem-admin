import type React from 'react';

export type DropdownProps = React.ComponentPropsWithRef<'div'>;

export const Dropdown = ({ children, ...props }: DropdownProps) => {
  return (
    <div
      absolute
      bg-white
      color='#333'
      shadow='sm #1a1a1a4d'
      font-size-4
      w-max
      min-w-200px
      px-2
      py-3
      z-100
      {...props}
    >
      {children}
    </div>
  );
};
