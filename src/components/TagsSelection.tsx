import type React from 'react';
import { useState } from 'react';
import type { TagSection } from '../lib/tags';
import clsx from 'clsx';

export interface TagsSelectionProps extends React.HTMLAttributes<HTMLDivElement> {
  tags: TagSection[];
  value?: number[];
  onModify?: (e: number) => void;
}

export const TagsSelection = ({
  className,
  tags,
  value,
  onModify,
  ...props
}: TagsSelectionProps) => {
  const [filter, setFilter] = useState('');

  return (
    <div className={clsx('pa-tags', className)} {...props}>
      <div className='pa-tag-section shown'>
        <input
          type='text'
          className='pa-tag-search lfe-form-sz-small'
          placeholder='搜索标签'
          onChange={e => setFilter(e.target.value)}
        />
      </div>
      {tags.map(e => (
        <div
          key={e.name}
          className={clsx(
            'pa-tag-section',
            e.children.some(f => f.name.toLowerCase().includes(filter.toLowerCase())) && 'shown'
          )}
        >
          <div className='pa-tag-title'>{e.name}</div>
          <div className={'pa-tag-list'}>
            {e.children.map(f => (
              <button
                key={f.id}
                type='button'
                className={clsx(
                  'lfe-caption',
                  'pa-tag',
                  value?.includes(f.id) && 'selected',
                  f.name.toLowerCase().includes(filter.toLowerCase()) && 'shown'
                )}
                onClick={() => onModify?.(f.id)}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
