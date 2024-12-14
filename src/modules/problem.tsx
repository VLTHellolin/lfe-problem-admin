import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { addHooker, matchUrl } from '../lib/utils';
import { problemDifficultyMapToOld, problemDifficultyName } from '../lib/difficulty';
import { getFormattedTags, updateTagsIncrementally, type TagSection } from '../lib/tags';
import type { ProblemInfo } from '../lib/lfeTypes';
import { DB } from '../lib/storage';
import { csPost } from '../lib/request';
import { LegacyButton } from '../components/LegacyButton';
import { LegacyDropdown } from '../components/LegacyDropdown';
import { Modal } from '../components/Modal';
import { TagsSelection } from '../components/TagsSelection';
import { GM_getValue, GM_setValue, GM_registerMenuCommand } from '$';
import { showError, showSuccess } from '../lib/swal';

const Panel = () => {
  const tagsDB = new DB('lfeData');
  const [dropdownShown, setDropdownShown] = useState(false);
  const [modalShown, setModalShown] = useState(0);

  const [problemSolution, setProblemSolution] = useState(false);
  const ProblemSolution = () => {
    return (
      <label>
        <input
          type='checkbox'
          checked={problemSolution}
          onChange={e => setProblemSolution(e.target.checked)}
        />
        <span>&nbsp;选中为开，不选为关</span>
      </label>
    );
  };

  const originalProblemDifficulty = _feInjection.currentData.problem.difficulty as number;
  const [problemDifficulty, setProblemDifficulty] = useState(originalProblemDifficulty);
  const isDeltaTooSmall = () =>
    originalProblemDifficulty !== 0 &&
    problemDifficulty !== 0 &&
    Math.abs(originalProblemDifficulty - problemDifficulty) === 1;
  const ProblemDifficulty = () => {
    return (
      <>
        <select
          value={problemDifficulty}
          onChange={e => setProblemDifficulty(Number.parseInt(e.target.value))}
        >
          {problemDifficultyName.map((e, i) => (
            <option key={e} value={i}>
              {e}
            </option>
          ))}
        </select>
        {isDeltaTooSmall() && (
          <div style={{ color: '#e74c3c' }}>
            你即将把此题难度从 {problemDifficultyName[originalProblemDifficulty]} 更改到{' '}
            {problemDifficultyName[problemDifficulty]}。<br />
            管理组认为，两个跨度及以上的难度更改才是必要的。请再三思考是否有必要改动难度。
          </div>
        )}
      </>
    );
  };

  const [problemTags, setProblemTags] = useState(_feInjection.currentData.problem.tags as number[]);
  const [problemTagsInc, setProblemTagsInc] = useState(false);
  const [tagList, setTagList] = useState([] as TagSection[]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run after the initial render.
  useEffect(() => {
    tagsDB.get('luoguTags').then(e => {
      setTagList(getFormattedTags(e));
    });
  }, []);

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
        <TagsSelection
          tags={tagList}
          value={problemTags}
          onModify={e => {
            const index = problemTags.indexOf(e);
            if (index === -1) setProblemTags([...problemTags, e]);
            else setProblemTags(problemTags.filter(f => f !== e));
          }}
        />
      </>
    );
  };

  const [problemUpdateList, setProblemUpdateList] = useState('');

  const handleSuccess = () => {
    const list = [_feInjection.currentData.problem.pid];
    if (problemUpdateList) problemUpdateList.split(' ');
    setModalShown(0);

    if (modalShown === 3 && problemTagsInc) {
      updateTagsIncrementally(list, problemTags);
      return;
    }

    const result: Partial<ProblemInfo> = {};
    if (modalShown === 1) {
      result.acceptSolution = problemSolution;
    } else if (modalShown === 2) {
      result.difficulty = problemDifficultyMapToOld(problemDifficulty);
    } else if (modalShown === 3) {
      result.tags = problemTags;
    }

    Promise.all(list.map(e => csPost(`/sadmin/api/problem/partialUpdate/${e}`, result)))
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
        <LegacyButton theme='dark' onClick={() => setDropdownShown(!dropdownShown)}>
          管理题目
        </LegacyButton>
        {dropdownShown && (
          <LegacyDropdown>
            <LegacyButton theme='primary' onClick={() => setModalShown(1)}>
              题解通道
            </LegacyButton>
            <LegacyButton theme='primary' onClick={() => setModalShown(2)}>
              题目难度
            </LegacyButton>
            <LegacyButton theme='primary' onClick={() => setModalShown(3)}>
              题目标签
            </LegacyButton>
          </LegacyDropdown>
        )}
      </span>
      {modalShown !== 0 && (
        <Modal
          header='题目管理'
          onSuccess={handleSuccess}
          onCancel={() => setModalShown(0)}
          long={modalShown === 3}
        >
          <div>
            如果你要批量操作题目，在下面输入其他题目的 PID，空格分隔。
            <input
              type='text'
              className='lfe-form-sz-small'
              placeholder='P1001 P1002 ...'
              onChange={e => setProblemUpdateList(e.target.value)}
            />
          </div>
          <br />
          {modalShown === 1 && ProblemSolution()}
          {modalShown === 2 && ProblemDifficulty()}
          {modalShown === 3 && ProblemTags()}
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
    rootElement.id = 'pa-problem-panel';
    loaded = true;
    createRoot(rootElement).render(<Panel />);
  },
  selector: '.header > .functional > .operation',
  active: () => !loaded,
};

if (
  matchUrl(['/problem']) &&
  _feInjection.currentTemplate === 'ProblemShow' &&
  GM_getValue<boolean>('show-problem-panel', true)
) {
  addHooker(hooker);
}

GM_registerMenuCommand('更改是否显示「管理题目」', () => {
  GM_setValue('show-problem-panel', window.confirm('确认为显示，取消为不显示'));
  window.location.reload();
});
