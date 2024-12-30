import { csGet, csPost } from './request';
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
  Promise.all(pid.map(e => csGet(`/problem/${e}?_contentOnly=1`)))
    .then(resp => {
      const result = resp.map(e => {
        // biome-ignore lint/suspicious/noExplicitAny: too lazy
        return { tags: [...new Set(tags.concat((e.json as any).currentData.problem.tags))] };
      });

      Promise.all(pid.map((e, i) => csPost(`/sadmin/api/problem/partialUpdate/${e}`, result[i])))
        .then(() => {
          showSuccess();
        })
        .catch(err => {
          showError(err);
        });
    })
    .catch(err => {
      showError(err);
    });
};
