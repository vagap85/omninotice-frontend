import { useMemo, type ReactNode } from 'react';

import { useFormValues } from '@/components/molecules/Form/hooks/useFormValues';

import { PushNotificationContext } from '../Contexts/PushNotificationContext';
import type { PushNotificationFormValues } from '../types/types';

interface PushFormValues extends PushNotificationFormValues {
  variableValues?: Record<string, string>;
}

export function PushNotificationProvider({
  children
}: {
  children: ReactNode;
}) {
  const values = useFormValues<PushFormValues>('pushNotification');

  const contextValue = useMemo(
    () => ({
      title: values.title ?? '',
      text: values.text ?? '',
      buttonText: values.buttonText ?? '',
      variableValues: values.variableValues ?? {}
    }),
    [values.title, values.text, values.buttonText, values.variableValues]
  );

  return (
    <PushNotificationContext.Provider value={contextValue}>
      {children}
    </PushNotificationContext.Provider>
  );
}
