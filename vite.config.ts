import pkg from './package.json';
import { defineConfig } from 'vite';
import reactPlugin from '@vitejs/plugin-react';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
  build: {
    minify: true,
  },
  plugins: [
    reactPlugin(),
    monkey({
      entry: 'src/index.ts',
      build: {
        externalGlobals: {
          react: ['React', 'https://cdn.hellolin.top/npm/react@18.3.1/umd/react.production.min.js'],
          'react-dom': [
            'ReactDOM',
            'https://cdn.hellolin.top/npm/react-dom@18.3.1/umd/react-dom.production.min.js',
          ],
          idb: ['idb', 'https://cdn.hellolin.top/npm/idb@8.0.0/build/umd.js'],
        },
      },
      userscript: {
        name: pkg.name,
        namespace: pkg.name,
        description: pkg.description,
        author: pkg.author,
        version: pkg.version,
        license: pkg.license,
        connect: ['www.luogu.com.cn'],
        match: ['*://www.luogu.com.cn/problem*', '*://www.luogu.com.cn/sadmin/article/review*'],
        updateURL:
          'https://github.com/VLTHellolin/lfe-problem-admin/releases/latest/download/lfe-problem-admin.user.js',
        downloadURL:
          'https://github.com/VLTHellolin/lfe-problem-admin/releases/latest/download/lfe-problem-admin.user.js',
      },
    }),
  ],
});
