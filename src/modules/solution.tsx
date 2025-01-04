import { StrictMode, useEffect, useState } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { request } from '../lib/request';
import { type Solution, loadSolutionSelection } from '../lib/solution';
import { DB } from '../lib/storage';
import { type Hooker, addHooker } from '../lib/utils';

const Panel = () => {
  const [modalShown, setModalShown] = useState(false);

  const ProblemSolution = () => {
    const db = new DB('problem-admin-history', 2);
    const [selectedSolution, setSelectedSolution] = useState([] as Solution[]);
    const [pageNumber, setPageNumber] = useState(1);
    const [sentRequests, setSentRequests] = useState(0);
    const [sentState, setSentState] = useState(0);
    const maxConcurrentRequests = 5;
    const requestDelay = 700;

    // biome-ignore lint/correctness/useExhaustiveDependencies: only run after the initial render.
    useEffect(() => {
      db.get('selected').then(e => setSelectedSolution(e ?? []));
    }, []);

    const withdraw = async () => {
      let index = 0;

      const processQueue = async () => {
        if (index >= selectedSolution.length) return;

        for (let i = 0; i < maxConcurrentRequests && index < selectedSolution.length; i++) {
          await request(`/sadmin/api/article/promote/${selectedSolution[index++].id}?withdraw=1`, {
            method: 'POST',
          });
          setSentRequests(e => e + 1);
        }

        await new Promise(r => setTimeout(r, requestDelay));
        await processQueue();
      };
      await processQueue();
    };

    const clearHandler = async () => {
      setSelectedSolution([]);
      await db.set('selected', []);
    };
    const updateHandler = async () => {
      setSentState(1);
      setSentRequests(0);
      try {
        await withdraw();
      } catch (err) {
        setSentState(3);
        console.error(err);
        return;
      }

      setSentState(2);
      await clearHandler();
    };

    return (
      <Modal header='管理题解' long onSuccess={() => setModalShown(false)}>
        现在选择了 {selectedSolution.length} 篇题解。
        <br />
        <Button size='middle' theme='primary' onClick={clearHandler}>
          取消选择
        </Button>
        <Button size='middle' theme='error' onClick={updateHandler}>
          撤下所有题解
        </Button>
        {sentState !== 0 && <br />}
        {sentState === 1 && (
          <span>
            正在撤下：{sentRequests} / {selectedSolution.length}
          </span>
        )}
        {sentState === 2 && <span>选中的题解已全部撤下。</span>}
        {sentState === 3 && <span>撤下题解时发生错误，错误信息已输出到控制台。</span>}
        <br />
        每页 50 篇题解。当前在第 {pageNumber} 页，
        <Button size='small' onClick={() => pageNumber !== 1 && setPageNumber(pageNumber - 1)}>
          上一页
        </Button>
        <Button size='small' onClick={() => pageNumber !== Math.ceil(selectedSolution.length / 50) && setPageNumber(pageNumber + 1)}>
          下一页
        </Button>
        <br />
        <ul>
          {selectedSolution?.slice(pageNumber * -50, pageNumber === 1 ? undefined : (pageNumber - 1) * -50).map(e => (
            <li key={e.id}>
              <a href={`https://www.luogu.com.cn/article/${e.id}/edit`} target='_blank' rel='noreferrer'>
                U{e.author} 的文章：{e.title}，作为 {e.pid} 的题解，{new Date(e.time).toLocaleString('zh-CN')}
              </a>
            </li>
          ))}
        </ul>
      </Modal>
    );
  };

  return (
    <>
      <span>
        <Button theme='dark' onClick={() => setModalShown(true)}>
          管理题解
        </Button>
      </span>
      {modalShown && <ProblemSolution />}
    </>
  );
};

let root: Root;
const hooker: Hooker = {
  onMount(elements) {
    const rootElement = document.createElement('div');
    elements[0].appendChild(rootElement);
    rootElement.id = 'pa-solution-panel';

    root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <Panel />
      </StrictMode>
    );
  },
  onUnmount() {
    root.unmount();
  },
  selector: '.main-container header .header-layout > div > div',
  pathSelector: /^\/problem\/solution\/.*$/,
};

addHooker(hooker);

const solutionSelectionHooker: Hooker = {
  onMount() {
    loadSolutionSelection();
  },
  onUnmount() {},
  selector: '.main-container main .solution-list',
  pathSelector: /^\/problem\/solution\/.*$/,
};

addHooker(solutionSelectionHooker);
