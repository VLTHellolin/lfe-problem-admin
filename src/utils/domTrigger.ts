export interface Trigger {
  selector: string;
  path?: RegExp;
  onMount: (elements: Element[]) => void;
  onUnmount?: () => void;
}

interface TriggerWithStatus extends Trigger {
  mounted: boolean;
}

const globalTriggerList: TriggerWithStatus[] = [];

const executeTrigger = (trigger: TriggerWithStatus) => {
  const resultElements = [...document.body.querySelectorAll(trigger.selector)];
  if (resultElements.length !== 0) {
    trigger.onMount(resultElements);
    trigger.mounted = true;
  }
};

const mutationObserver = new MutationObserver(() => {
  for (const trigger of globalTriggerList) {
    if (trigger.path && !trigger.path.test(location.pathname)) {
      if (trigger.mounted) {
        trigger.onUnmount?.();
        trigger.mounted = false;
      }
    } else if (!trigger.mounted) {
      executeTrigger(trigger);
    }
  }
});

mutationObserver.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
});

export const addTrigger = (userTrigger: Trigger) => {
  const trigger: TriggerWithStatus = {
    ...userTrigger,
    mounted: false,
  };
  globalTriggerList.push(trigger);
  executeTrigger(trigger);
};
