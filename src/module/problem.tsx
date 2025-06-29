import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { useAutoMergedState } from '@/hooks/useAutoMergedState';
import { useState } from 'react';
import useSWR from 'swr';

interface ProblemData {
  acceptSolution: boolean;
  difficulty: number;
  tags: number[];
}

const problemDifficultyName = ['暂无评定', '入门', '普及-', '普及/提高-', '普及+/提高', '提高+/省选-', '省选/NOI-', 'NOI/NOI+/CTSC'];
const problemDifficultyMapToOld = (i: number) => [0, 2, 3, 5, 6, 8, 10, 11][i];

const useProblemData = (pid: string) => {
  const { data, error, isLoading } = useSWR(`/problem/${pid}`);

  const problemDocument = new DOMParser().parseFromString(data, 'text/html');
  const problemData: ProblemData = JSON.parse(problemDocument.querySelector('#lentille-context')?.textContent as any).data.problem;

  return {
    problem: problemData,
    error,
    isLoading,
  };
};

const Panel = () => {
  const pid = (/^\/problem\/(.*)$/.exec(location.pathname))![1];
  const { problem, isLoading, error } = useProblemData(pid);

  const [updatedProblem, setUpdatedProblem] = useAutoMergedState(problem);
  const [dialogShown, setDialogShown] = useState(false);

  return (
    <>
      <span>
        <Button theme='dark' onClick={() => { setDialogShown(true); }} disabled={isLoading || !!error}>管理题目</Button>
      </span>
      {dialogShown && (
        <Modal header='管理题目' onCancel={() => { setDialogShown(false); }}>
          <div ml-4 />
          <h4>题解通道</h4>
          <label>
            <input type='checkbox' checked={problem.acceptSolution} onChange={e => { setUpdatedProblem({ acceptSolution: e.target.checked }); }} />
            <span ml-2>接受题解提交</span>
          </label>
          <div ml-4 />
          <h4>题目难度</h4>
          <label>
            <select value={problem.difficulty} onChange={e => { setUpdatedProblem({ difficulty: problemDifficultyMapToOld(Number(e.target.value)) }); }}>
              {problemDifficultyName.map((name, i) => (
                <option key={name} value={i}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <div ml-4 />
          <h4>题目标签</h4>
        </Modal>
      )}
    </>
  );
};

