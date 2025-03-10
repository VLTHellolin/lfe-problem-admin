import reactPlugin from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';
import pkg from './package.json';

export default defineConfig({
  build: { minify: true },
  plugins: [
    reactPlugin(),
    monkey({
      entry: 'src/index.ts',
      build: {
        externalGlobals: {
          'react': ['React', 'https://cdn.hellolin.top/npm/react@18.3.1/umd/react.production.min.js'],
          'react-dom': ['ReactDOM', 'https://cdn.hellolin.top/npm/react-dom@18.3.1/umd/react-dom.production.min.js'],
          'sweetalert2': ['Swal', 'https://cdn.hellolin.top/npm/sweetalert2@11.17.2/dist/sweetalert2.all.min.js'],
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
        match: ['*://www.luogu.com.cn/*'],
        updateURL: 'https://github.com/VLTHellolin/lfe-problem-admin/releases/latest/download/lfe-problem-admin.user.js',
        downloadURL: 'https://github.com/VLTHellolin/lfe-problem-admin/releases/latest/download/lfe-problem-admin.user.js',
      },
    }),
  ],
});
