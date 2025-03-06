import type { Review } from './review';
import Swal from 'sweetalert2';
import { DB } from './storage';

export const exportBackup = async () => {
  const db = new DB('problem-admin-history', 2);
  const history: Review[] | undefined = await db.get('history');
  if (history === undefined || history.length === 0) {
    await Swal.fire({
      icon: 'error',
      title: '导出失败',
      text: '没有数据可以导出。',
    });
    return;
  }
  const data = JSON.stringify(history);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'backup.json';
  a.click();
};

export const importBackup = async () => {
  const { value: file }: { value?: File } = await Swal.fire({
    title: '选择文件',
    input: 'file',
    inputAttributes: { accept: 'application/json' },
  });
  if (!file) {
    await Swal.fire({
      icon: 'error',
      title: '导入失败',
      text: '没有选择文件。',
    });
    return;
  }

  const reader = new FileReader();
  reader.onload = async e => {
    if (!e.target?.result) {
      await Swal.fire({
        icon: 'error',
        title: '导入失败',
        text: '文件内容为空。',
      });
      return;
    }
    const db = new DB('problem-admin-history', 2);
    const data = JSON.parse(e.target.result as string);
    await db.set('history', data);
    await Swal.fire({
      icon: 'success',
      title: '导入成功',
    });
  };

  reader.readAsText(file);
};

export const cleanHistory = async () => {
  const { isConfirmed } = await Swal.fire({
    icon: 'question',
    title: '你确定要清空历史记录吗？',
    showCancelButton: true,
  });
  if (isConfirmed) {
    const db = new DB('problem-admin-history', 2);
    await db.set('history', []);
    await Swal.fire({
      icon: 'success',
      title: '清空成功',
    });
  }
};
