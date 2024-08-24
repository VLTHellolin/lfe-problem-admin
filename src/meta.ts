// Webpack says it's a CommonJS file, make it happy.

// import pkg from '../package.json';
const pkg = require('../package.json');

// export default {
module.exports = {
  name: pkg.name,
  version: pkg.version,
  connect: ['www.luogu.com.cn'],
  match: ['*://www.luogu.com.cn/problem/*'],
  description: pkg.description,
  author: pkg.author,
  updateURL:
    'https://github.com/VLTHellolin/lfe-problem-admin/releases/latest/download/lfe-problem-admin.user.js',
  downloadURL:
    'https://github.com/VLTHellolin/lfe-problem-admin/releases/latest/download/lfe-problem-admin.user.js',
};
