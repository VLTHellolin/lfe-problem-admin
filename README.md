## lfe-problem-admin [![MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Problem management panel for lfe.

### 直接安装

1. 确保浏览器安装了 [Tampermonkey](https://www.tampermonkey.net)，或者其他能够执行 Greasemonkey 脚本的插件。
2. [点击这个链接](https://github.com/VLTHellolin/lfe-problem-admin/releases/latest/download/lfe-problem-admin.user.js)，插件应该会打开安装界面。如果没有，请手动复制打开页面后的代码并导入。

### 从源码构建

```bash
git clone https://github.com/VLTHellolin/lfe-problem-admin.git
cd lfe-problem-admin
pnpm install
# 启动开发服务器
pnpm dev
# 构建静态文件
pnpm build
```

### 常见问题

> Q. 本脚本对于洛谷之前各审核脚本的兼容性？\
> A. 见下表。

| 脚本名                   | 兼容性   | 备注                           |
| ------------------------ | -------- | ------------------------------ |
| `sbb-ng-0.0.1.user.js`   | 不兼容   | 该脚本同样不兼容新版审核后台。 |
| `关闭题解通道`           | 不兼容   |
| `shittim.v0.1.0.user.js` | 理论兼容 | 但我没用过。                   |
| `smallbookbook.user.js`  | 理论兼容 | 该脚本作用于旧版审核后台。     |
| `题解审核反馈优化`       | 理论兼容 | 该脚本作用于旧版审核后台。     |
| `bHZrYWl5aTA4MTE`        | 理论兼容 | 该脚本作用于旧版审核后台。     |

> Q. 为什么不提供更多审核反馈原因选择？\
> A. 对于旧版后台，你可以安装上面提到的插件。\
> 对于新版后台，洛谷已经自带一个较为完善的原因选择，本项目不做重复工作。

> Q. vite 开发服务器怎么用不了？\
> A. 你需要找方法关闭 [内容安全策略](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP)。