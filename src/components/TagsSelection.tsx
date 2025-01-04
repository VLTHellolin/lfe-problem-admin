import clsx from 'clsx';
import type React from 'react';
import { useState } from 'react';
import type { Tag, TagSection } from '../lib/tags';

export interface TagsSelectionProps extends React.HTMLAttributes<HTMLDivElement> {
  tags: TagSection[];
  selectedTags: Tag[];
  onTagUpdate?: (t: Tag[]) => void;
}

export const TagsSelection = ({ className, tags, selectedTags, onTagUpdate, ...props }: TagsSelectionProps) => {
  const [filter, setFilter] = useState('');

  const tagUpdateHandler = (t: Tag) => {
    let nextTags = Array.from(selectedTags);
    if (nextTags.some(e => e.id === t.id)) nextTags = nextTags.filter(e => e.id !== t.id);
    else nextTags.push(t);
    onTagUpdate?.(nextTags);
  };

  return (
    <div className={clsx('pa-tags', className)} {...props}>
      <div className='pa-tag-section shown'>
        <input type='text' className='pa-tag-search lform-size-small' placeholder='搜索标签' onChange={e => setFilter(e.target.value)} />
      </div>

      <div className='pa-tag-section shown'>
        <div className='pa-tag-title'>已选择标签</div>
        <div className='pa-tag-list'>
          {selectedTags.map(t => (
            <button key={t.id} type='button' className='lfe-caption pa-tag selected shown' onClick={() => tagUpdateHandler(t)}>
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {tags.map(s => (
        <div key={s.name} className={clsx('pa-tag-section', s.children.some(f => f.name.toLowerCase().includes(filter.toLowerCase())) && 'shown')}>
          <div className='pa-tag-title'>{s.name}</div>
          <div className='pa-tag-list'>
            {s.children.map(t => (
              <button
                key={t.id}
                type='button'
                className={clsx(
                  'lfe-caption',
                  'pa-tag',
                  selectedTags?.some(e => e.id === t.id) && 'selected',
                  t.name.toLowerCase().includes(filter.toLowerCase()) && 'shown'
                )}
                onClick={() => tagUpdateHandler(t)}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
