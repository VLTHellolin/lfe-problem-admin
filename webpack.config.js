import path from 'path';
import { fileURLToPath } from 'url';
import terser from 'terser-webpack-plugin';
import { UserscriptPlugin } from 'webpack-userscript';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

export default {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'lfe-problem-admin.js',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  optimization: {
    minimize: true,
    innerGraph: true,
    minimizer: [
      new terser({
        parallel: true,
        extractComments: false,
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    jquery: '$',
    localforage: 'localforage',
  },
  plugins: [
    new UserscriptPlugin({
      headers: {
        name: pkg.name,
        description: pkg.description,
        author: pkg.author,
        version: pkg.version,
        license: pkg.license,
        connect: ['www.luogu.com.cn'],
        match: [
          '*://www.luogu.com.cn/problem*',
          '*://www.luogu.com.cn/sadmin/article/review*',
        ],
        require: [
          'https://cdn.hellolin.top/npm/jquery@3.7.1/dist/jquery.min.js',
          'https://cdn.hellolin.top/npm/localforage@1.10.0/dist/localforage.min.js',
        ],
        resource: [
          'tagsData  https://cdn.hellolin.top/gh/VLTHellolin/lfe-problem-admin/src/data/tags.json',
        ],
        grant: ['GM_getResourceText'],
        updateURL:
          'https://github.com/VLTHellolin/lfe-problem-admin/releases/latest/download/lfe-problem-admin.user.js',
        downloadURL:
          'https://github.com/VLTHellolin/lfe-problem-admin/releases/latest/download/lfe-problem-admin.user.js',
      },
      pretty: true,
      strict: true,
      whitelist: true,
    }),
  ],
};
