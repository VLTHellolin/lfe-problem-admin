import type React from 'react';
import { cva } from 'class-variance-authority';

export interface TagProps extends React.ComponentPropsWithRef<'button'> {
  selected?: boolean;
}

const themeVariants = cva([], {
  variants: {
    selected: {
      false: 'bg-white text-black border-#bfbfbf',
      true: 'bg-secondary text-white border-secondary',
    },
  },
  defaultVariants: {
    selected: false,
  },
});

export const Tag = ({ children, className, selected, ...props }: TagProps) => {
  return (
    <button
      type='button'
      className={themeVariants({ selected, className })}
      inline-block
      mr-3 mb-3
      px-1px py-8px
      cursor-pointer
      rounded-2px
      border='1 solid'
      hover:opacity='85'
      {...props}
    >
      {children}
    </button>
  );
};
