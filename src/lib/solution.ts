import { throttle } from 'throttle-debounce';
import { request } from './request';
import { DB } from './storage';

export interface Solution {
  id: string;
  author: number;
  title: string;
  pid: string;
  time: number;
}

const loadData = async () => {
  // eslint-disable-next-line no-console
  console.info('[lfe-problem-admin] (Re)Loaded solution management components.');

  const controller = new AbortController();

  const solutionList: Solution[] = JSON.parse(
    await request(
      window.location.href,
      { headers: { 'X-Lentille-Request': 'content-only' } },
    ),
  ).data.solutions.result.map((e: any) => ({
    id: e.lid,
    author: e.author.uid,
    title: e.title,
    pid: e.solutionFor.pid,
    time: e.time * 1000,
  }));
  const solutionHTMLList = document.querySelectorAll('.solution-list .solution-article');

  const db = new DB('problem-admin-history', 2);
  let selectedSolutionList: Solution[] = (await db.get('selected')) ?? [];

  for (const [index, solutionHTML] of solutionHTMLList.entries()) {
    const solution = solutionList[index];

    const solutionOperation = solutionHTML.querySelector('.header .right') as Element;
    const isLoadedPreviously = solutionOperation.querySelector('label') !== null;

    const solutionLabel = isLoadedPreviously ? solutionOperation.querySelector('label')! : document.createElement('label');
    const solutionCheckbox = isLoadedPreviously ? solutionOperation.querySelector('input')! : document.createElement('input');
    if (!isLoadedPreviously) {
      solutionLabel.textContent = ' 选中题解';
      solutionCheckbox.type = 'checkbox';
    }
    solutionCheckbox.checked = selectedSolutionList.some(e => e.id === solution.id);

    solutionCheckbox.addEventListener('change', () => {
      if (solutionCheckbox.checked) {
        selectedSolutionList.push(solution);
      } else {
        selectedSolutionList = selectedSolutionList.filter(e => e.id !== solution.id);
      }
      void db.set('selected', selectedSolutionList);
    }, { signal: controller.signal });

    if (!isLoadedPreviously) {
      solutionOperation.prepend(solutionLabel);
      solutionLabel.prepend(solutionCheckbox);
    }
  }

  return () => {
    controller.abort();
  };
};


export const loadSolutionSelection = () => {
  let cleanup: (() => void) | undefined;
  const load = throttle(400, async () => {
    cleanup?.();
    cleanup = await loadData();
  }, { noTrailing: true });

  load();

  const ob = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'childList' && (record.target as Element).nodeName === 'TIME')
        load();
    }
  });

  ob.observe(document.querySelector('.solution-list')!, {
    childList: true,
    subtree: true,
  });
};
