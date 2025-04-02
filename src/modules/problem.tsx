import { createContext, StrictMode, use, useMemo, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import useSWR from 'swr';
import { Button } from '../components/Button';
import { Dropdown } from '../components/Dropdown';
import { Modal } from '../components/Modal';
import { Tag as TagComponent } from '../components/Tag';
import { request } from '../lib/request';
import { DB } from '../lib/storage';
import { showError, showSuccess } from '../lib/swal';
import { getFormattedTags, type Tag } from '../lib/tags';
import { addHooker, type Hooker } from '../lib/utils';

const LfeDataDB = new DB('lfeData');

const PidContext = createContext<string>('');

interface ProblemData {
  acceptSolution: boolean;
  difficulty: number;
  tags: number[];
}

const problemDifficultyName = ['暂无评定', '入门', '普及-', '普及/提高-', '普及+/提高', '提高+/省选-', '省选/NOI-', 'NOI/NOI+/CTSC'];
const problemDifficultyMapToOld = (d: number) => [0, 2, 3, 5, 6, 8, 10, 11][d];

const useProblemData = (pid: string) => {
  const { data, error, isLoading } = useSWR(`/problem/${pid}`);

  const problemDocument = new DOMParser().parseFromString(data, 'text/html');
  const problemData: ProblemData = JSON.parse(problemDocument.querySelector('#lentille-context')?.textContent as any).data.problem;

  return {
    problem: problemData,
    isError: error,
    isLoading,
  };
};

const updateProblemData = async (pid: string, data: Partial<ProblemData>) => {
  const result = data;
  if (data.difficulty !== undefined) {
    result.difficulty = problemDifficultyMapToOld(data.difficulty);
  }

  try {
    await request(`/sadmin/api/problem/partialUpdate/${pid}`, {
      method: 'POST',
      body: result,
    });
    showSuccess();
  } catch (err) {
    showError(err);
  }
};

const ToggleProblemSolution = () => {
  const pid = use(PidContext);
  const { problem } = useProblemData(pid);

  const [solution, setSolution] = useState(problem.acceptSolution);

  return (
    <Modal header='管理题目' onSuccess={() => { void updateProblemData(pid, { acceptSolution: solution }); }}>
      <label>
        <input type='checkbox' checked={solution} onChange={() => { setSolution(!solution); }} />
        <span ml-2>选中为开，不选为关</span>
      </label>
    </Modal>
  );
};

const ToggleProblemDifficulty = () => {
  const pid = use(PidContext);
  const { problem } = useProblemData(pid);

  const [difficulty, setDifficulty] = useState(problem.difficulty);

  return (
    <Modal header='管理题目' onSuccess={() => { void updateProblemData(pid, { difficulty }); }}>
      <select value={difficulty} onChange={e => { setDifficulty(Number(e.target.value)); }}>
        {problemDifficultyName.map((name, index) => (
          <option key={name} value={index}>
            {name}
          </option>
        ))}
      </select>
    </Modal>
  );
};

const ModifyProblemTags = () => {
  const pid = use(PidContext);
  const { problem } = useProblemData(pid);
  const rawTags = useMemo<Record<number, Tag>>(
    () => use(LfeDataDB.get('luoguTags')),
    [],
  );
  const tags = useMemo(
    () => getFormattedTags(rawTags),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [filter, setFilter] = useState('');
  const [selectedTags, setSelectedTags] = useState(problem.tags);

  const updateSelectedTags = (t: number) => {
    let nextTags = Array.from(selectedTags);
    if (nextTags.some(e => e === t))
      nextTags = nextTags.filter(e => e !== t);
    else
      nextTags.push(t);
    setSelectedTags(nextTags);
  };

  return (
    <Modal header='管理题目'>
      <div>
        <input type='text' placeholder='搜索标签' onChange={e => { setFilter(e.target.value); }} />
      </div>

      <div>
        <div m-4 color='#e8e8e8' />
        <h4>已选择的标签</h4>
        <div>
          {selectedTags.map(e => (
            <TagComponent
              key={rawTags[e].id}
              selected
              onClick={() => { updateSelectedTags(e); }}
            >
              {rawTags[e].name}
            </TagComponent>
          ))}
        </div>
      </div>

      {tags.map(section => (
        <div key={section.name}>
          <div m-4 color='#e8e8e8' />
          <h4>{section.name}</h4>
          <div>
            {section.children.map(e => (
              <TagComponent
                key={e.id}
                hidden={!e.name.toLowerCase().includes(filter.toLowerCase()) }
                selected={selectedTags.some(f => f === e.id)}
                onClick={() => { updateSelectedTags(e.id); }}
              >
                {e.name}
              </TagComponent>
            ))}
          </div>
        </div>
      ))}
    </Modal>
  );
};

const Panel = () => {
  const pid = (/^\/problem\/(.*)$/.exec(location.pathname))![1];
  const operations = ['题解通道', '题目难度', '题目标签'];

  const [shownDropdown, setShownDropdown] = useState(false);
  const [openedModal, setOpenedModal] = useState<number | null>(null);

  return (
    <PidContext value={pid}>
      <span>
        <Button theme='dark' onClick={() => { setShownDropdown(true); }}>管理题目</Button>
        {shownDropdown && (
          <Dropdown>
            {operations.map((name, index) => (
              <Button key={name} theme='primary' onClick={() => { setOpenedModal(index); }}>
                {name}
              </Button>
            ))}
          </Dropdown>
        )}
      </span>
      {openedModal === 1 && <ToggleProblemSolution />}
      {openedModal === 2 && <ToggleProblemDifficulty />}
      {openedModal === 3 && <ModifyProblemTags />}
    </PidContext>
  );
};

let root: Root;
const onMount = (elements: Element[]) => {
  const rootElement = document.createElement('div');
  elements[0].appendChild(rootElement);
  rootElement.id = 'pa-problem-panel';

  root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <Panel />
    </StrictMode>,
  );
};
const onUnmount = () => {
  root.unmount();
};

const hooker: Hooker = {
  onMount,
  onUnmount,
  selector: '.main-container header .header-layout > div > div',
  pathSelector: /^\/problem\/(?!.*(list)).*$/,
};

addHooker(hooker);
