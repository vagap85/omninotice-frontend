import { ReactNode } from 'react';

import { FormIdContext } from '../FormContext';

export function FormProvider({ formId, children }: { formId: string; children: ReactNode }) {
  return <FormIdContext.Provider value={formId}>{children}</FormIdContext.Provider>;
}