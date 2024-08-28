// Webpack says it's a CommonJS file, make it happy.
// eslint-disable-next-line
const pkg = require('../package.json');

module.exports = {
  name: pkg.name,
  version: pkg.version,
  connect: ['www.luogu.com.cn'],
  match: [
    '*://www.luogu.com.cn/problem*',
    '*://www.luogu.com.cn/sadmin/article/review*',
  ],
  resource: [
    'tagsData  https://cdn.hellolin.top/gh/VLTHellolin/lfe-problem-admin/src/data/tags.json',
  ],
  description: pkg.description,
  author: pkg.author,
  updateURL:
    'https://github.com/VLTHellolin/lfe-problem-admin/releases/latest/download/lfe-problem-admin.user.js',
  downloadURL:
    'https://github.com/VLTHellolin/lfe-problem-admin/releases/latest/download/lfe-problem-admin.user.js',
};
