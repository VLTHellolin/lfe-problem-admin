export const matchUrl = (pattern: (RegExp | string)[], withParam = false) => {
  const current = location.pathname + (withParam ? location.search : '');
  return pattern.some(e => current.match(e));
};

const getElemsFromNodes = (nodes: Node[]) => {
  const result: Element[] = [];
  for (const node of nodes) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      result.push(node as Element);
    } else if (node.parentElement) {
      result.push(node.parentElement);
    }
  }
  return result;
};

interface Hooker {
  callback: (nodes: Element[]) => void;
  selector: string;
  active?: () => boolean;
}
const execHooker = (hooker: Hooker, nodes: Element[]) => {
  const result: Element[] = [];
  for (const node of nodes) {
    if (node.matches(hooker.selector)) result.push(node);
    result.push(...node.querySelectorAll(hooker.selector));
  }
  if (result.length !== 0) hooker.callback(result);
};

const hookerList: Hooker[] = [];
const observer = new MutationObserver(records => {
  for (const record of records) {
    const rawNodes = record.type === 'attributes' ? [record.target] : Array.from(record.addedNodes);
    const nodes = getElemsFromNodes(rawNodes);
    for (const hooker of hookerList) (hooker.active ?? (() => true))() && execHooker(hooker, nodes);
  }
});

export const addHooker = (hooker: Hooker) => {
  hookerList.push(hooker);
  execHooker(hooker, [document.body]);
};

observer.observe(document.body, { childList: true, subtree: true, attributes: true });
