import type { FeInjection, FeInstance } from './lib/lfeTypes';

declare global {
  const _feInjection: FeInjection | undefined;
  const _feInstance: FeInstance | undefined;
}

import './assets/index.css';
import './modules/problem';
import './modules/review';
