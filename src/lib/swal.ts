export const showSuccess = () => {
  _feInstance.$swalSuccess('操作成功');
  const content = document.querySelector('.swal2-container #swal2-content');
  if (!content) return;
  content.setAttribute('style', '');
  content.innerHTML = '<img src="https://cdn.luogu.com.cn/upload/image_hosting/i47l3bvw.png" width="40%"/>';
};

// biome-ignore lint/suspicious/noExplicitAny: too lazy
export const showError = (err?: any) => {
  const errorMsg = err?.json?.errorMessage as string | undefined;
  console.error(err);
  _feInstance.$swalError('操作失败', `错误信息已输出到控制台。${errorMsg && '可能有用的信息：'}${errorMsg}`);
};
