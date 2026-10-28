import type { JSONContent } from '@tiptap/core';
import { useMemo, type ReactNode } from 'react';

import { useFormValues } from '@/components/molecules/Form/hooks/useFormValues';
import { telegramMessageJsonToHtml } from '@/components/molecules/helpers/telegramMessageFormat';

import { TelegramNotificationContext } from '../Contexts/TelegramNotificationContext';

interface TelegramNotificationFormValues {
  message?: JSONContent;
  buttonText?: string;
}

export function TelegramNotificationProvider({
  children
}: {
  children: ReactNode;
}) {
  const values =
    useFormValues<TelegramNotificationFormValues>('telegramNotification');

  const contextValue = useMemo(
    () => ({
      messageHtml: values.message
        ? telegramMessageJsonToHtml(values.message)
        : '',
      buttonText: values.buttonText ?? ''
    }),
    [values.message, values.buttonText]
  );

  return (
    <TelegramNotificationContext.Provider value={contextValue}>
      {children}
    </TelegramNotificationContext.Provider>
  );
}
