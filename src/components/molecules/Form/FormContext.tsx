import { createContext, useContext, useRef, ReactNode } from 'react';
import { createFormStore } from './formStore';
import type { FormsRegistry, FormStore } from '../types/form';

function createFormsRegistry(): FormsRegistry {
  const stores = new Map<string, FormStore>();
  return {
    getOrCreateStore(formId) {
      if (!stores.has(formId)) stores.set(formId, createFormStore());
      return stores.get(formId)!;
    },
    getStore(formId) {
      return stores.get(formId);
    },
  };
}

const FormsRegistryContext = createContext<FormsRegistry | null>(null);

export function FormsRegistryProvider({ children }: { children: ReactNode }) {
  const ref = useRef<FormsRegistry | null>(null);
  if (!ref.current) ref.current = createFormsRegistry();
  return <FormsRegistryContext.Provider value={ref.current}>{children}</FormsRegistryContext.Provider>;
}

export function useFormsRegistry(): FormsRegistry {
  const ctx = useContext(FormsRegistryContext);
  if (!ctx) throw new Error('Компонент должен быть внутри <FormsRegistryProvider>');
  return ctx;
}

const FormIdContext = createContext<string | null>(null);

export function FormProvider({ formId, children }: { formId: string; children: ReactNode }) {
  return <FormIdContext.Provider value={formId}>{children}</FormIdContext.Provider>;
}

export function useFormStore(explicitFormId?: string): FormStore {
  const registry = useFormsRegistry();
  const ctxFormId = useContext(FormIdContext);
  const id = explicitFormId ?? ctxFormId;
  if (!id) throw new Error('Укажите formId явно или оберните в <FormProvider formId="...">');
  return registry.getOrCreateStore(id);
}