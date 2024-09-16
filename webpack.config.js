import path from 'path';
import { fileURLToPath } from 'url';
import { monkey } from 'webpack-monkey';
import terser from 'terser-webpack-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default monkey({
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'lfe-problem-admin.user.js',
  },
  externals: {
    jquery: 'https://cdn.hellolin.top/npm/jquery@3.7.1/dist/jquery.min.js',
    localforage:
      'https://cdn.hellolin.top/npm/localforage@1.10.0/dist/localforage.min.js',
  },
  resolve: {
    extensions: ['.ts', '.json', '...'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
    ],
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
  monkey: {
    meta: {
      resolve: () => path.resolve('./src/meta.ts'),
    },
  },
});
