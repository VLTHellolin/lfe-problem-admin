import { StrictMode, useEffect, useState } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { cleanHistory, exportBackup, importBackup } from '../lib/backup';
import { type Review, articleCategories } from '../lib/review';
import { DB } from '../lib/storage';
import { type Hooker, addHooker } from '../lib/utils';

const db = new DB('problem-admin-history', 2);
let weekStart = new Date();
let weekEnd = new Date();
const Panel = () => {
  const [modalShown, setModalShown] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState([0, 0]);
  const [weekCount, setWeekCount] = useState([0, 0]);
  const [history, setHistory] = useState([] as Review[]);

  useEffect(() => {
    (async () => {
      const dbHistory = (await db.get('history')) ?? [];
      const nextTotalCount = [0, 0];
      const nextWeekCount = [0, 0];

      updateWeekDuration();

      for (const current of dbHistory) {
        ++nextTotalCount[current.accepted ? 1 : 0];
        if (new Date(current.time) >= weekStart) ++nextWeekCount[current.accepted ? 1 : 0];
      }

      setHistory(dbHistory);
      setTotalCount(nextTotalCount);
      setWeekCount(nextWeekCount);
    })();

    window.addEventListener('luogu:admin:article-review', articleReviewHandler);
    return () => window.removeEventListener('luogu:admin:article-review', articleReviewHandler);
  }, []);

  const updateWeekDuration = () => {
    const date = new Date();
    const weekDay = date.getDay();
    date.setDate(date.getDate() - (weekDay === 0 ? 6 : weekDay - 1));
    date.setHours(0, 0, 0, 0);
    weekStart = new Date(date);
    date.setDate(date.getDate() + 7);
    weekEnd = new Date(date);
  };

  const historyUpdateHandler = (current: Review) => {
    setHistory(h => {
      const result = [...h, current];
      db.set('history', result);

      if (new Date() >= weekEnd) {
        updateWeekDuration();
        setWeekCount(c => [0, 0]);
      }

      setTotalCount(c => [c[0] + (current.accepted ? 0 : 1), c[1] + (current.accepted ? 1 : 0)]);
      setWeekCount(c => [c[0] + (current.accepted ? 0 : 1), c[1] + (current.accepted ? 1 : 0)]);

      return result;
    });
  };
  const articleReviewHandler = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    const article = detail.getArticle();

    document.body.querySelector('#app .main-container .main .l-card:last-child .review-header:last-child button')?.addEventListener(
      'click',
      () => {
        const current = {
          id: article.lid,
          author: article.author.uid,
          title: article.title,
          category: article.category,
          pid: article.solutionFor?.pid,
          collection: article.collection ?? undefined,
          time: new Date().toLocaleString('zh-CN'),
          accepted: detail.getReviewResult().accept,
        };
        // Avoid slow re-rendering.
        setTimeout(() => historyUpdateHandler(current));
      },
      { once: true }
    );
  };

  const getRateText = (a: number, b: number) => {
    if (a + b === 0) return `${a + b} / ${a} / ${b} / 0%`;
    return `${a + b} / ${a} / ${b} / ${((a / (a + b)) * 100).toFixed(2).toString()}%`;
  };

  return (
    <>
      <Button theme='primary' spacing onClick={() => setModalShown(true)}>
        历史记录
      </Button>
      {modalShown && (
        <Modal header='历史记录' long onSuccess={() => setModalShown(false)}>
          <div>
            <Button theme='primary' size='middle' spacing onClick={importBackup}>
              导入记录
            </Button>
            <Button theme='primary' size='middle' spacing onClick={exportBackup}>
              导出记录
            </Button>
            <Button theme='error' size='middle' spacing onClick={cleanHistory}>
              清空记录
            </Button>
          </div>
          <br />
          总审核数量 / 通过 / 拒绝 / 通过率：
          {getRateText(totalCount[1], totalCount[0])}
          <br />
          本周审核数量 / 通过 / 拒绝 / 通过率：
          {getRateText(weekCount[1], weekCount[0])}
          <br />
          越新审核的越靠前，每页 50 条记录。当前在第 {pageNumber} 页，
          <Button size='small' onClick={() => pageNumber !== 1 && setPageNumber(pageNumber - 1)}>
            上一页
          </Button>
          <Button size='small' onClick={() => pageNumber !== Math.ceil(history.length / 50) && setPageNumber(pageNumber + 1)}>
            下一页
          </Button>
          <br />
          <ul>
            {history
              ?.slice(pageNumber * -50, pageNumber === 1 ? undefined : (pageNumber - 1) * -50)
              .reverse()
              .map(e => (
                <li key={e.time}>
                  <a href={`https://www.luogu.com.cn/article/${e.id}/edit`} target='_blank' rel='noreferrer'>
                    U{e.author} 的文章
                    {e.title && `：${e.title}`}
                    {e.category && e.category !== 2 && `，${articleCategories[e.category]}`}
                    {e.pid && `，作为 ${e.pid} 的题解`}
                    {e.collection && `，投稿至 ${e.collection.id} ${e.collection.name}`}，{e.accepted ? '通过' : '打回'}，{e.time}
                  </a>
                </li>
              ))}
          </ul>
        </Modal>
      )}
    </>
  );
};

let root: Root;
const hooker: Hooker = {
  onMount(elements: Element[]) {
    document.body.classList.add('pa-overflow-fix');

    const rootElement = document.createElement('div');
    elements[0].appendChild(rootElement);

    root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <Panel />
      </StrictMode>
    );
  },
  onUnmount() {
    document.body.classList.remove('pa-overflow-fix');

    root.unmount();
  },
  selector: '#app > .top-bar > .left',
  pathSelector: /^\/sadmin\/article\/review\/?$/,
};

addHooker(hooker);
