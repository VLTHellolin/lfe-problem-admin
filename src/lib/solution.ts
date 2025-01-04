import { DB } from './storage';

export interface Solution {
  id: string;
  author: number;
  title: string;
  pid: string;
  time: number;
}

export const loadSolutionSelection = async () => {
  const db = new DB('problem-admin-history', 2);
  const solutionList = JSON.parse(document.querySelector('#lentille-context')?.textContent as string).data.solutions.result;
  let selectedSolutionList: Solution[] = (await db.get('selected')) ?? [];

  const solutionHTMLList = document.querySelectorAll('.main-container main .solution-list .solution-article');

  for (const [index, solutionHTML] of solutionHTMLList.entries()) {
    const solution = solutionList[index];

    const solutionOperation = solutionHTML.querySelector('.header .right') as Element;
    const solutionLabel = document.createElement('label');
    solutionLabel.textContent = ' 选中题解';
    const solutionCheckbox = document.createElement('input');
    solutionCheckbox.type = 'checkbox';
    solutionCheckbox.checked = selectedSolutionList.some(e => e.id === solution.lid);

    solutionCheckbox.addEventListener('change', () => {
      if (solutionCheckbox.checked) {
        selectedSolutionList.push({
          id: solution.lid,
          author: solution.author.uid,
          title: solution.title,
          pid: solution.solutionFor.pid,
          time: solution.time * 1000,
        });
      } else {
        selectedSolutionList = selectedSolutionList.filter(e => e.id !== solution.lid);
      }
      db.set('selected', selectedSolutionList);
    });

    solutionOperation.prepend(solutionLabel);
    solutionLabel.prepend(solutionCheckbox);
  }
};
