import { useCallback, useSyncExternalStore } from "react";

import { useFormsRegistry } from "./useFormsRegistry";

export function useFormValues<T = Record<string, unknown>>(formId: string): T {
  const registry = useFormsRegistry();
  const store = registry.getOrCreateStore(formId);

  const subscribe = useCallback(
    (cb: () => void) => store.subscribeAll(cb),
    [store],
  );
  const getSnapshot = useCallback(() => store.getValues<T>(), [store]);

  return useSyncExternalStore(subscribe, getSnapshot);
}
