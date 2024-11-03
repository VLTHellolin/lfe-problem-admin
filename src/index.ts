import type { FeInjection, FeInstance } from './lib/lfeTypes';

declare global {
  const _feInjection: FeInjection;
  const _feInstance: FeInstance;
}

import './assets/index.styl';
import './modules/problem';
