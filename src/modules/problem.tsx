import { StrictMode, useEffect, useState } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { Button } from '../components/Button';
import { Dropdown } from '../components/Dropdown';
import { Modal } from '../components/Modal';
import { TagsSelection } from '../components/TagsSelection';
import { problemDifficultyMapToOld, problemDifficultyName } from '../lib/difficulty';
import type { ProblemInfo } from '../lib/lfeTypes';
import { getProblemData } from '../lib/problem';
import { request } from '../lib/request';
import { DB } from '../lib/storage';
import { showError, showSuccess } from '../lib/swal';
import { type Tag, type TagSection, getFormattedTags, updateTagsIncrementally } from '../lib/tags';
import { type Hooker, addHooker } from '../lib/utils';

const Panel = () => {
  const tagsDB = new DB('lfeData');
  const [tagList, setTagList] = useState([] as TagSection[]);

  const [currentProblem, setCurrentProblem] = useState({} as ProblemInfo);
  const [problemSolution, setProblemSolution] = useState(false);
  const [problemDifficulty, setProblemDifficulty] = useState(0);
  const [problemTags, setProblemTags] = useState([] as Tag[]);

  const [problemTagsInc, setProblemTagsInc] = useState(false);
  const [problemUpdateList, setProblemUpdateList] = useState('');

  const [dropdownShown, setDropdownShown] = useState(false);
  const [modalShown, setModalShown] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run after the initial render.
  useEffect(() => {
    tagsDB.get('luoguTags').then(async e => {
      setTagList(getFormattedTags(e));

      const data = await getProblemData();
      if (data === undefined) return;
      setCurrentProblem(data);
      setProblemDifficulty(data.difficulty);
      setProblemTags(Object.values(e).filter(t => data.tags.includes((t as Tag).id)) as Tag[]);
    });
  }, []);

  const ProblemSolution = () => {
    return (
      <label>
        <input type='checkbox' checked={problemSolution} onChange={e => setProblemSolution(e.target.checked)} />
        <span>&nbsp;选中为开，不选为关</span>
      </label>
    );
  };

  const isDeltaTooSmall = () =>
    currentProblem.difficulty !== 0 && problemDifficulty !== 0 && Math.abs(currentProblem.difficulty - problemDifficulty) === 1;
  const ProblemDifficulty = () => {
    return (
      <>
        <select value={problemDifficulty} onChange={e => setProblemDifficulty(Number.parseInt(e.target.value))}>
          {problemDifficultyName.map((e, i) => (
            <option key={e} value={i}>
              {e}
            </option>
          ))}
        </select>
        {isDeltaTooSmall() && (
          <div style={{ color: '#e74c3c' }}>
            你即将把此题难度从 {problemDifficultyName[currentProblem.difficulty]} 更改到 {problemDifficultyName[problemDifficulty]}。<br />
            管理组认为，两个跨度及以上的难度更改才是必要的。请再三思考是否有必要改动难度。
          </div>
        )}
      </>
    );
  };

  const ProblemTags = () => {
    return (
      <>
        <label>
          <input
            type='checkbox'
            checked={problemTagsInc}
            onChange={e => {
              setProblemTagsInc(e.target.checked);
              setProblemTags([]);
            }}
          />
          增量更新（而非覆写更新）
        </label>
        <TagsSelection tags={tagList} selectedTags={problemTags} onTagUpdate={e => setProblemTags(e)} />
      </>
    );
  };

  const handleSuccess = () => {
    const list = [currentProblem.pid];
    if (problemUpdateList) problemUpdateList.split(' ');
    setModalShown(0);

    const problemNumberTags = problemTags.map(e => e.id);

    if (modalShown === 3 && problemTagsInc) {
      updateTagsIncrementally(list, problemNumberTags);
      return;
    }

    const result: Partial<ProblemInfo> = {};
    if (modalShown === 1) {
      result.acceptSolution = problemSolution;
    } else if (modalShown === 2) {
      result.difficulty = problemDifficultyMapToOld(problemDifficulty);
    } else if (modalShown === 3) {
      result.tags = problemNumberTags;
    }

    Promise.all(list.map(e => request(`/sadmin/api/problem/partialUpdate/${e}`, { method: 'POST', body: result })))
      .then(() => {
        showSuccess();
      })
      .catch(err => {
        showError(err);
      });
  };

  return (
    <>
      <span>
        <Button theme='dark' onClick={() => setDropdownShown(!dropdownShown)}>
          管理题目
        </Button>
        {dropdownShown && (
          <Dropdown>
            <Button theme='primary' onClick={() => setModalShown(1)}>
              题解通道
            </Button>
            <Button theme='primary' onClick={() => setModalShown(2)}>
              题目难度
            </Button>
            <Button theme='primary' onClick={() => setModalShown(3)}>
              题目标签
            </Button>
          </Dropdown>
        )}
      </span>
      {modalShown !== 0 && (
        <Modal header='题目管理' onSuccess={handleSuccess} onCancel={() => setModalShown(0)} long={modalShown === 3}>
          <div>
            如果你要批量操作题目，在下面输入其他题目的 PID，空格分隔。
            <input type='text' className='lfe-form-sz-small' placeholder='P1001 P1002 ...' onChange={e => setProblemUpdateList(e.target.value)} />
          </div>
          <br />
          {modalShown === 1 && <ProblemSolution />}
          {modalShown === 2 && <ProblemDifficulty />}
          {modalShown === 3 && <ProblemTags />}
        </Modal>
      )}
    </>
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
    </StrictMode>
  );
};
const onUnmount = () => {
  root.unmount();
};

const hooker: Hooker = {
  onMount,
  onUnmount,
  selector: '.header > .functional > .operation',
  pathSelector: /^\/problem\/(?!.*(list|solution)).*$/,
};

addHooker(hooker);

const solutionHooker: Hooker = {
  onMount,
  onUnmount,
  selector: '.main-container header .header-layout > div > div',
  pathSelector: /^\/problem\/solution\/.*$/,
};

addHooker(solutionHooker);
