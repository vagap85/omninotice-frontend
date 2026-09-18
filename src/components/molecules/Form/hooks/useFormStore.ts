import { useContext } from 'react';

import type { FormStore } from '../../types/form';
import { FormIdContext } from '../FormContext';

import { useFormsRegistry } from './useFormsRegistry';



export function useFormStore(explicitFormId?: string): FormStore {
  const registry = useFormsRegistry();
  const ctxFormId = useContext(FormIdContext);
  const id = explicitFormId ?? ctxFormId;
  if (!id) throw new Error('Укажите formId явно или оберните в <FormProvider formId="...">');
  return registry.getOrCreateStore(id);
}