import Swal from 'sweetalert2';

export const showSuccess = () => {
  Swal.fire({
    icon: 'success',
    title: '操作成功',
    html: '<img src="https://cdn.luogu.com.cn/upload/image_hosting/i47l3bvw.png" width="40%"/>',
  });
};

// biome-ignore lint/suspicious/noExplicitAny: too lazy
export const showError = (err?: any) => {
  const errorMsg = err?.json?.errorMessage as string | undefined;
  console.error(err);
  Swal.fire({
    icon: 'error',
    title: '操作失败',
    html: `错误信息已输出到控制台。<br/>${errorMsg && '可能有用的信息：'}${errorMsg}`,
  });
};
