import type { FeInjection } from './lib/lfeTypes';

declare global {
  const _feInjection: FeInjection | undefined;
}

import './assets/index.css';
import './modules/problem';
import './modules/review';
import './modules/solution';
