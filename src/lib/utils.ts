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
  triggerHooker(initHooker);
};

const triggerHooker = (hooker: HookerWithStatus) => {
  const result = [...document.body.querySelectorAll(hooker.selector)];
  if (result.length !== 0) {
    hooker.onMount(result);
    hooker.mounted = true;
  }
};

const observer = new MutationObserver(() => {
  for (const hooker of hookerList) {
    if (!hooker.pathSelector.test(location.pathname)) {
      if (hooker.mounted) {
        hooker.onUnmount();
        hooker.mounted = false;
      }
    } else if (!hooker.mounted) {
      triggerHooker(hooker);
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true, attributes: true });
