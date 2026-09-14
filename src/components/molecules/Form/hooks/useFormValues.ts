import { useCallback, useSyncExternalStore } from "react";
import { useFormsRegistry } from "../FormContext";

export function useFormValues(formId: string): Record<string, any> {
  const registry = useFormsRegistry();
  const store = registry.getOrCreateStore(formId);

  const subscribe = useCallback(
    (cb: () => void) => store.subscribeAll(cb),
    [store],
  );
  const getSnapshot = useCallback(() => store.getValues(), [store]);

  return useSyncExternalStore(subscribe, getSnapshot);
}
