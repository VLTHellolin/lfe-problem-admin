export interface Hooker {
  onMount: (elements: Element[]) => void;
  onUnmount: () => void;
  selector: string;
  pathSelector: RegExp;
}

interface HookerWithStatus extends Hooker {
  mounted: boolean;
}
const hookerList: HookerWithStatus[] = [];

export const addHooker = (hooker: Hooker) => {
  const initHooker: HookerWithStatus = { ...hooker, mounted: false };
  hookerList.push(initHooker);
  triggerHooker(initHooker, [document.body]);
};

const triggerHooker = (hooker: HookerWithStatus, elements: Element[]) => {
  const result: Element[] = [];
  for (const element of elements) {
    if (element.matches(hooker.selector)) result.push(element);
    result.push(...element.querySelectorAll(hooker.selector));
  }
  if (result.length !== 0) {
    hooker.onMount(result);
    hooker.mounted = true;
  }
};

const getElementsFromNodes = (nodes: Node[]) => {
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

const observer = new MutationObserver(records => {
  for (const record of records) {
    const nodes = record.type === 'attributes' ? [record.target] : Array.from(record.addedNodes);
    const elements = getElementsFromNodes(nodes);
    for (const hooker of hookerList) {
      if (!hooker.pathSelector.test(location.pathname)) {
        if (hooker.mounted) {
          hooker.onUnmount();
          hooker.mounted = false;
        }
      } else if (!hooker.mounted) {
        triggerHooker(hooker, elements);
      }
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true, attributes: true });
