import clsx from 'clsx';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { Tag, TagSection } from '../lib/tags';

export interface TagsSelectionProps extends React.HTMLAttributes<HTMLDivElement> {
  tags: TagSection[];
  value?: number[];
  onModify?: (e: number) => void;
}

export const TagsSelection = ({ className, tags, value, onModify, ...props }: TagsSelectionProps) => {
  const [filter, setFilter] = useState('');
  let [selectedTags, setSelectedTags] = useState([] as Tag[]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Tags don't change
  useEffect(() => {
    selectedTags = [];
    setSelectedTags([]);
    for (const section of tags) {
      for (const tag of section.children) {
        if (value?.includes(tag.id)) selectedTags.push(tag);
      }
    }
    setSelectedTags(selectedTags);
  }, [value]);

  return (
    <div className={clsx('pa-tags', className)} {...props}>
      <div className='pa-tag-section shown'>
        <input type='text' className='pa-tag-search lfe-form-sz-small' placeholder='搜索标签' onChange={e => setFilter(e.target.value)} />
      </div>

      <div className={clsx('pa-tag-section', selectedTags.length !== 0 && 'shown')}>
        <div className='pa-tag-title'>已选择标签</div>
        <div className='pa-tag-list'>
          {selectedTags.map(f => (
            <button
              key={f.id}
              type='button'
              className={clsx('lfe-caption', 'pa-tag', 'selected', f.name.toLowerCase().includes(filter.toLowerCase()) && 'shown')}
              onClick={() => onModify?.(f.id)}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {tags.map(e => (
        <div key={e.name} className={clsx('pa-tag-section', e.children.some(f => f.name.toLowerCase().includes(filter.toLowerCase())) && 'shown')}>
          <div className='pa-tag-title'>{e.name}</div>
          <div className='pa-tag-list'>
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
