import { type ProblemInfo } from './types';

const API = '/sadmin/api/problem/partialUpdate/';

const updateSuccess = function () {
  _feInstance.$swalSuccess('操作成功', '');
  $('.swal2-container #swal2-content').append(
    '<img src="https://cdn.luogu.com.cn/upload/image_hosting/i47l3bvw.png" width="40%"/>'
  );
};
const updateFailed = function (xhr: JQueryXHR, status: string) {
  _feInstance.$swalError(
    '操作失败',
    `${status} ${xhr.status}: ${xhr.statusText}\n如果你认为这不是你的问题，请前往 GitHub 仓库反馈。\n错误信息已输出到控制台。`
  );
  console.error(xhr);
};

// Send update request to server.
// If debug mode is enabled, it will only output an update info through the console.
export const updateProblem = async function (info: Partial<ProblemInfo>) {
  await $.ajax(API + _feInjection.currentData.problem.pid, {
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(info),
    error: updateFailed,
    success: updateSuccess,
  });
};
