import type {
  FieldConfig,
  FieldState,
  FormStore,
  Listener,
} from "../types/form";

const EMPTY_STATE: FieldState = { value: "", error: undefined, touched: false };

export function createFormStore(): FormStore {
  const fields = new Map<string, FieldState>();
  const configs = new Map<string, FieldConfig>();
  const listeners = new Map<string, Set<Listener>>();
  const globalListeners = new Set<Listener>();

  let valuesCache: Record<string, unknown> | null = null;
  let hasAttemptedSubmit = false;

  const invalidateValuesCache = () => {
    valuesCache = null;
  };

  const notify = (name: string) => {
    invalidateValuesCache();
    listeners.get(name)?.forEach((l) => l());
    globalListeners.forEach((l) => l());
  };

  const hasField = (name: string) => fields.has(name);

  const registerField = <T>(
    name: string,
    config: FieldConfig<T> = {} as FieldConfig<T>,
  ) => {
    if (!fields.has(name)) {
      fields.set(name, {
        value: config.initialValue ?? "",
        error: undefined,
        touched: false,
      });
      invalidateValuesCache();
    }
    configs.set(name, config as FieldConfig<unknown>);
  };

  const unregisterField = (name: string) => {
    fields.delete(name);
    configs.delete(name);
    listeners.delete(name);
    invalidateValuesCache();
  };

  const getSnapshot = (name: string): FieldState =>
    fields.get(name) ?? EMPTY_STATE;

  const subscribe = (name: string, listener: Listener) => {
    if (!listeners.has(name)) listeners.set(name, new Set());
    listeners.get(name)!.add(listener);
    return () => listeners.get(name)?.delete(listener);
  };

  const subscribeAll = (listener: Listener) => {
    globalListeners.add(listener);
    return () => globalListeners.delete(listener);
  };

  const getValues = <T = Record<string, unknown>>(): T => {
    if (valuesCache === null) {
      const result: Record<string, unknown> = {};
      fields.forEach((state, name) => (result[name] = state.value));
      valuesCache = result;
    }
    return valuesCache as T;
  };

  const runValidators = (
    name: string,
    value: unknown,
    onlyImmediate = false,
  ): string | undefined => {
    const cfg = configs.get(name);
    if (!cfg?.validators?.length) return undefined;
    const allValues = getValues();
    for (const validate of cfg.validators) {
      if (onlyImmediate && !validate.immediate) continue;
      const error = validate(value, allValues);
      if (error) return error;
    }
    return undefined;
  };

  const setValue = (name: string, value: unknown) => {
    const prev = fields.get(name) ?? EMPTY_STATE;
    fields.set(name, { ...prev, value });
    invalidateValuesCache();

    const cfg = configs.get(name);

    if (hasAttemptedSubmit || cfg?.validateOnChange) {
      // после сабмита (или если поле явно попросили validateOnChange) — проверяем все правила
      const error = runValidators(name, value);
      fields.set(name, { ...fields.get(name)!, error, touched: true });
    } else {
      // до сабмита — реагируем только на "мгновенные" правила типа maxLength,
      // required и подобные молчат до blur/submit
      const error = runValidators(name, value, /* onlyImmediate */ true);
      if (error) {
        fields.set(name, { ...fields.get(name)!, error, touched: true });
      } else {
        // если ошибки от immediate-валидаторов нет — явно очищаем предыдущую immediate-ошибку
        // (например, длина была больше лимита, потом уменьшилась)
        const current = fields.get(name)!;
        if (current.error) {
          fields.set(name, { ...current, error: undefined });
        }
      }
    }

    notify(name);
  };

  const setFieldError = (name: string, error: string | undefined) => {
    const prev = fields.get(name) ?? EMPTY_STATE;
    fields.set(name, { ...prev, error, touched: true });
    notify(name);
  };

  const validateField = (name: string): boolean => {
    const state = fields.get(name) ?? EMPTY_STATE;
    const error = runValidators(name, state.value);
    fields.set(name, { ...state, error, touched: true });
    notify(name);
    return !error;
  };

  const validateAll = (): boolean => {
    hasAttemptedSubmit = true;
    let valid = true;
    fields.forEach((_, name) => {
      if (!validateField(name)) valid = false;
    });
    return valid;
  };

  const handleBlur = (name: string) => {
    if (!hasAttemptedSubmit) {
      const prev = fields.get(name) ?? EMPTY_STATE;
      if (!prev.touched) {
        fields.set(name, { ...prev, touched: true });
        notify(name);
      }
      return;
    }
    validateField(name);
  };

  const reset = (values: Record<string, unknown> = {}) => {
    hasAttemptedSubmit = false;
    fields.forEach((_, name) => {
      fields.set(name, {
        value: values[name] ?? configs.get(name)?.initialValue ?? "",
        error: undefined,
        touched: false,
      });
      notify(name);
    });
  };

  return {
    hasField,
    registerField,
    unregisterField,
    getSnapshot,
    subscribe,
    subscribeAll,
    setValue,
    setFieldError,
    validateField,
    validateAll,
    handleBlur,
    getValues,
    reset,
  };
}
