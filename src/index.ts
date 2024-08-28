import { type FeInjection, type FeInstance } from './lib/types';
import 'jquery';

declare global {
  const _feInjection: FeInjection;
  const _feInstance: FeInstance;
  const GM_getResourceText: (name: string) => string;
}

import modules from './modules';

for (const mod of modules) {
  $(mod.load);
}

const ob = new MutationObserver((records) => {
  for (const record of records) {
    const nodes =
      record.type === 'attributes' ? [record.target] : record.addedNodes;

    nodes.forEach((node) => {
      for (const mod of modules) {
        if (mod.obCondition && mod.obCondition(node as Element)) {
          mod.load();
        }
      }
    });
  }
});
ob.observe(document.body, { subtree: true, childList: true });
