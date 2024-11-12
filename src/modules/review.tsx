import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { addHooker, matchUrl } from '../lib/utils';
import { DB } from '../lib/storage';
import { articleCategories, type Review } from '../lib/review';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';

const Panel = () => {
  const db = new DB('problem-admin-history');

  const historyUpdateHandler = (current: Review) => {
    // If we call setHistory directly, the history value will not be changed immediately.
    // To avoid database problems, we use the following method.
    history.push(current);
    setHistory(history);
    db.set('history', history);

    ++totalCount[current.accepted ? 1 : 0];
    ++weekCount[current.accepted ? 1 : 0];
    setTotalCount(totalCount);
    setWeekCount(weekCount);

    if (new Date() >= weekEnd) updateWeekCount();
  };
  const articleReviewHandler = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    const article = detail.getArticle();

    document
      .querySelector(
        '#app .main-container .main .l-card:last-child .review-header:last-child button'
      )
      ?.addEventListener('click', () => {
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
      });
  };

  const [modalShown, setModalShown] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState([0, 0] as [number, number]);
  const [weekCount, setWeekCount] = useState([0, 0] as [number, number]);
  let [history, setHistory] = useState([] as Review[]);
  let weekStart = new Date();
  let weekEnd = new Date();

  const updateWeekCount = () => {
    const date = new Date();
    const weekDay = date.getDay();
    date.setDate(date.getDate() - (weekDay === 0 ? 6 : weekDay - 1));
    date.setHours(0, 0, 0, 0);
    weekStart = new Date(date);
    date.setDate(date.getDate() + 7);
    weekEnd = new Date(date);
    for (let i = history.length - 1; i >= 0; --i) {
      const current = history[i];
      if (new Date(current.time) < weekStart) break;
      ++weekCount[current.accepted ? 1 : 0];
    }
    setWeekCount(weekCount);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run after the initial render.
  useEffect(() => {
    (async () => {
      history = (await db.get('history')) ?? [];
      setHistory(history);
      for (const current of history) {
        ++totalCount[current.accepted ? 1 : 0];
      }
      setTotalCount(totalCount);
      updateWeekCount();
    })();
    window.addEventListener('luogu:admin:article-review', articleReviewHandler);
    return () => window.removeEventListener('luogu:admin:article-review', articleReviewHandler);
  }, []);

  const getRateText = (a: number, b: number) => {
    if (a + b === 0) return `${a + b} / ${a} / ${b} / 0%`;
    return `${a + b} / ${a} / ${b} / ${((a / (a + b)) * 100).toFixed(2).toString()}%`;
  };
  const confirmDelete = async () => {
    if (
      window.confirm('确实要清除历史记录吗？所有数据将无法恢复！') &&
      window.confirm('第二次确认，确实要清除吗？')
    ) {
      await db.clear();
      window.alert('操作完成。');
      window.location.reload();
    }
  };

  return (
    <>
      <Button theme='primary' spacing onClick={() => setModalShown(true)}>
        历史记录
      </Button>
      <Button theme='error' spacing onClick={confirmDelete}>
        清除记录
      </Button>
      {modalShown && (
        <Modal header='历史记录' long onSuccess={() => setModalShown(false)}>
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
          <Button size='small' onClick={() => setPageNumber(pageNumber + 1)}>
            下一页
          </Button>
          <br />
          <ul>
            {history
              ?.slice(pageNumber * -50, pageNumber === 1 ? undefined : (pageNumber - 1) * -50)
              .reverse()
              .map(e => (
                <li key={e.time}>
                  <a
                    href={`https://www.luogu.com.cn/article/${e.id}/edit`}
                    target='_blank'
                    rel='noreferrer'
                  >
                    U{e.author} 的文章
                    {e.title && `：${e.title}`}
                    {e.category && e.category !== 2 && `，${articleCategories[e.category]}`}
                    {e.pid && `，作为 ${e.pid} 的题解`}
                    {e.collection && `，投稿至 ${e.collection.id} ${e.collection.name}`}，
                    {e.accepted ? '通过' : '打回'}，{e.time}
                  </a>
                </li>
              ))}
          </ul>
        </Modal>
      )}
    </>
  );
};

let loaded = false;
const hooker = {
  callback: (nodes: Element[]) => {
    const rootElement = document.createElement('div');
    nodes[0].appendChild(rootElement);
    loaded = true;
    createRoot(rootElement).render(<Panel />);
  },
  selector: '#app > .top-bar > .left',
  active: () => !loaded,
};

if (matchUrl(['/sadmin/article/review'])) {
  addHooker(hooker);
}
