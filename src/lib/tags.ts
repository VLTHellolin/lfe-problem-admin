export interface Tag {
  id: number;
  name: string;
  type: 'Algorithm' | 'Origin' | 'Time' | 'Region' | 'SpecialProblem' | 'Others';
  parent: number | null;
  color: string;
  hasChildren: boolean;
}
export interface TagSection {
  id: number;
  name: string;
  children: Tag[];
}
// Tags under Algorithm and Origin categories have a secondary category,
// which is stored in parent-children format in the original data.
// This function preprocesses all secondary category names.
export const getFormattedTags = (tags: Record<number, Tag>) => {
  const result: TagSection[] = [];
  result.push({ id: -2, name: '语言入门（请选择 [入门与面试] 题库）', children: [] });
  for (const tag of Object.values(tags)) {
    if (
      (tag.type === 'Algorithm' || tag.type === 'Origin') &&
      tag.id !== -2 &&
      tag.parent === null
    ) {
      result.push({ id: tag.id, name: tag.name, children: [] });
    }
  }
  result.push({ id: -10, name: '时间', children: [] });
  result.push({ id: -11, name: '区域', children: [] });
  result.push({ id: -12, name: '特殊题目', children: [] });
  result.push({ id: -13, name: '不可用标签', children: [] });

  const getSectionId = (e: Tag) => {
    const result = -10 - ['Time', 'Region', 'SpecialProblem', 'Others'].indexOf(e.type);
    return result === -9 ? (e.parent ?? -13) : result;
  };

  for (const tag of Object.values(tags)) {
    result.find(e => e.id === getSectionId(tag))?.children.push(tag);
  }
  return result;
};
