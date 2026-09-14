import type { FormsRegistry, FormStore } from '../types/form';
import { createFormStore } from './formStore';

export function createFormsRegistry(): FormsRegistry {
  const stores = new Map<string, FormStore>();

  return {
    getOrCreateStore(formId: string) {
      if (!stores.has(formId)) stores.set(formId, createFormStore());
      return stores.get(formId)!;
    },
    getStore(formId: string) {
      return stores.get(formId);
    },
  };
}