import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useFormStore } from "../FormContext";
import { FieldConfig } from "../../types/form";

export function useFormField<T = string>(name: string, config?: FieldConfig<T>) {
  const store = useFormStore();

  if (!store.hasField(name)) {
    store.registerField(name, config);
  }

  useEffect(() => () => store.unregisterField(name), [name]);

  const subscribe = useCallback((cb: () => void) => store.subscribe(name, cb), [store, name]);
  const getSnapshot = useCallback(() => store.getSnapshot(name), [store, name]);
  const state = useSyncExternalStore(subscribe, getSnapshot);

  const onChange = useCallback(
    (eOrValue: any) => {
      const value = eOrValue?.target !== undefined ? eOrValue.target.value : eOrValue;
      store.setValue(name, value);
    },
    [store, name]
  );

  const onBlur = useCallback(() => store.handleBlur(name), [store, name]);

  return { value: state.value as T, error: state.error, touched: state.touched, onChange, onBlur };
}
