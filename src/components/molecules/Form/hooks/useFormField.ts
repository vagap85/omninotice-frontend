import {
  useCallback,
  useEffect,
  useSyncExternalStore,
  ChangeEvent,
} from "react";

import { FieldConfig } from "../../types/form";

import { useFormStore } from "./useFormStore";

export function useFormField<T = string>(
  name: string,
  config?: FieldConfig<T>,
) {
  const store = useFormStore();

  if (!store.hasField(name)) {
    store.registerField<T>(name, config);
  }

  useEffect(() => () => store.unregisterField(name), [name, store]);

  const subscribe = useCallback(
    (cb: () => void) => store.subscribe(name, cb),
    [store, name],
  );
  const getSnapshot = useCallback(() => store.getSnapshot(name), [store, name]);
  const state = useSyncExternalStore(subscribe, getSnapshot);

  const onChange = useCallback(
    (
      eOrValue:
        | ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >
        | T,
    ) => {
      const value =
        eOrValue && typeof eOrValue === "object" && "target" in eOrValue
          ? eOrValue.target.value
          : eOrValue;
      store.setValue(name, value);
    },
    [store, name],
  );

  const onBlur = useCallback(() => store.handleBlur(name), [store, name]);

  return {
    value: state.value as T,
    error: state.error,
    touched: state.touched,
    onChange,
    onBlur,
  };
}
