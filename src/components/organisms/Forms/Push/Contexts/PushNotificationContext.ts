import { createContext, useContext } from 'react';

import type { PushNotificationFormValues } from '../types/types';

export interface PushNotificationContextValue
  extends PushNotificationFormValues {
  variableValues: Record<string, string>;
}

export const PushNotificationContext =
  createContext<PushNotificationContextValue | null>(null);

export function usePushNotification() {
  const context = useContext(PushNotificationContext);
  if (!context) {
    throw new Error(
      'usePushNotification должен использоваться внутри PushNotificationProvider'
    );
  }
  return context;
}
