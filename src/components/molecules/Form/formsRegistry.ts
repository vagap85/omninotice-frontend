import type { FormsRegistry } from '../types/form';

import { createFormStore } from './formStore';

export function createFormsRegistry(): FormsRegistry {
  const stores = new Map<string, ReturnType<typeof createFormStore>>();
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