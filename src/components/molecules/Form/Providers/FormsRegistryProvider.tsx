import { useState, ReactNode } from 'react';

import type { FormsRegistry } from '../../types/form';
import { FormsRegistryContext } from '../FormContext';
import { createFormsRegistry } from '../formsRegistry';


export function FormsRegistryProvider({ children }: { children: ReactNode }) {
  const [registry] = useState<FormsRegistry>(() => createFormsRegistry());
  return <FormsRegistryContext.Provider value={registry}>{children}</FormsRegistryContext.Provider>;
}