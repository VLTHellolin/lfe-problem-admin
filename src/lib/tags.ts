import { request } from './request';
import { showError, showSuccess } from './swal';

export interface Tag {
  id: number;
  name: string;
  type: 'Algorithm' | 'Origin' | 'Time' | 'Region' | 'SpecialProblem' | 'Others';
  parent: number | null;
  color?: string;
  hasChildren?: boolean;
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
  result.push({
    id: -2,
    name: '语言入门（请选择 [入门与面试] 题库）',
    children: [
      {
        id: -2,
        name: '语言入门（请选择 [入门与面试] 题库）',
        type: 'Algorithm',
        parent: null,
      },
    ],
  });
  for (const tag of Object.values(tags)) {
    if ((tag.type === 'Algorithm' || tag.type === 'Origin') && tag.id !== -2 && tag.parent === null) {
      result.push({ id: tag.id, name: tag.name, children: [tag] });
    }
  }
  result.push({ id: -10, name: '时间', children: [] });
  result.push({ id: -11, name: '区域', children: [] });
  result.push({ id: -12, name: '特殊题目', children: [] });
  result.push({ id: -13, name: '不可用标签', children: [] });

  const getSectionId = (e: Tag) => {
    const unlistedSectionId = ['Time', 'Region', 'SpecialProblem', 'Others'].indexOf(e.type);
    if (unlistedSectionId !== -1) return -10 - unlistedSectionId;
    return e.parent ?? -13;
  };

  for (const tag of Object.values(tags)) {
    if ((tag.type === 'Algorithm' || tag.type === 'Origin') && tag.parent === null && tag.hasChildren) continue;
    result.find(e => e.id === getSectionId(tag))?.children.push(tag);
  }
  return result;
};

export const updateTagsIncrementally = async (pid: string[], tags: number[]) => {
  const maxConcurrentRequests = 3;
  const requestDelay = 700;

  let index = 0;

  const processQueue = async () => {
    if (index >= pid.length) return;

    for (let i = 0; i < maxConcurrentRequests && index < pid.length; i++) {
      const result = await request(`/problem/${pid[index]}?_contentOnly=1`, { type: 'text/html' });
      console.log(result);
      const newTags = [...new Set(tags.concat(result.currentData.problem.tags))];
      await request(`/sadmin/api/problem/partialUpdate/${pid[index]}`, {
        method: 'POST',
        body: { tags: newTags },
      });
      index++;
    }

    await new Promise(r => setTimeout(r, requestDelay));
    await processQueue();
  };

  try {
    await processQueue();
  } catch (err) {
    showError(err);
    return;
  }

  showSuccess();
};
