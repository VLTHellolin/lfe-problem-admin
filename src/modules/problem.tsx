import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { addHooker, matchUrl } from '../lib/utils';
import { problemDifficultyMapToOld, problemDifficultyName } from '../lib/difficulty';
import { getFormattedTags, type TagSection } from '../lib/tags';
import type { ProblemInfo } from '../lib/lfeTypes';
import { DB } from '../lib/storage';
import { csPost } from '../lib/request';
import { LegacyButton } from '../components/LegacyButton';
import { LegacyDropdown } from '../components/LegacyDropdown';
import { Modal } from '../components/Modal';
import { TagsSelection } from '../components/TagsSelection';

const tagsDB = new DB('lfeData');

const Panel = () => {
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

  const [problemDifficulty, setProblemDifficulty] = useState(
    problemDifficultyMapToOld(_feInjection.currentData.problem.difficulty)
  );
  const ProblemDifficulty = () => {
    return (
      <select
        value={problemDifficulty}
        onChange={e => setProblemDifficulty(Number.parseInt(e.target.value))}
      >
        {problemDifficultyName.map((e, i) => (
          <option key={e} value={problemDifficultyMapToOld(i)}>
            {e}
          </option>
        ))}
      </select>
    );
  };

  const [problemTags, setProblemTags] = useState(_feInjection.currentData.problem.tags as number[]);
  const [tagList, setTagList] = useState([] as TagSection[]);
  tagsDB.get('luoguTags').then(e => {
    setTagList(getFormattedTags(e));
  });
  const ProblemTags = () => {
    return (
      <TagsSelection
        tags={tagList}
        value={problemTags}
        onModify={e => {
          const index = problemTags.indexOf(e);
          if (index === -1) problemTags.push(e);
          else setProblemTags(problemTags.filter(f => f !== e));
        }}
      />
    );
  };

  const [problemUpdateList, setProblemUpdateList] = useState('');

  const handleSuccess = () => {
    const result: Partial<ProblemInfo> = {};
    if (modalShown === 1) {
      result.acceptSolution = problemSolution;
    } else if (modalShown === 2) {
      result.difficulty = problemDifficulty;
    } else if (modalShown === 3) {
      result.tags = problemTags;
    }
    console.log(result);

    const list = problemUpdateList.split(' ').concat([_feInjection.currentData.problem.pid]);
    const promiseList = list.map(e => csPost(`/sadmin/api/problem/partialUpdate/${e}`, result));

    Promise.all(promiseList)
      .then(() => {
        _feInstance.$swalSuccess('操作成功');
        const content = document.querySelector('.swal2-container #swal2-content');
        if (!content) return;
        content.setAttribute('style', '');
        content.innerHTML =
          '<img src="https://cdn.luogu.com.cn/upload/image_hosting/i47l3bvw.png" width="40%"/>';
      })
      .catch(err => {
        _feInstance.$swalError(
          '操作失败',
          '如果你认为这不是你的问题，请找我反馈。错误信息已输出到控制台。'
        );
        console.error(err);
      });

    setModalShown(0);
  };

  return (
    <>
      <span>
        <LegacyButton onClick={() => setDropdownShown(!dropdownShown)}>管理题目</LegacyButton>
        <LegacyDropdown shown={dropdownShown}>
          <LegacyButton primary onClick={() => setModalShown(1)}>
            题解通道
          </LegacyButton>
          <LegacyButton primary onClick={() => setModalShown(2)}>
            题目难度
          </LegacyButton>
          <LegacyButton primary onClick={() => setModalShown(3)}>
            题目标签
          </LegacyButton>
        </LegacyDropdown>
      </span>
      <Modal
        header='题目管理'
        shown={!!modalShown}
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
    </>
  );
};

let loaded = false;
const hooker = {
  callback: (nodes: Element[]) => {
    const rootElement = document.createElement('div');
    nodes[0].appendChild(rootElement);
    createRoot(rootElement).render(<Panel />);
    loaded = true;
  },
  selector: '.header > .functional > .operation',
  active: () => !loaded,
};

if (matchUrl(['/problem']) && _feInjection.currentTemplate === 'ProblemShow') {
  addHooker(hooker);
}
