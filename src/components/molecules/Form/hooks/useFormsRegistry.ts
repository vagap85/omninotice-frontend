import { useContext } from 'react';

import type { FormsRegistry } from '../../types/form';
import { FormsRegistryContext } from '../FormContext';

export function useFormsRegistry(): FormsRegistry {
  const ctx = useContext(FormsRegistryContext);
  if (!ctx) throw new Error('Компонент должен быть внутри <FormsRegistryProvider>');
  return ctx;
}