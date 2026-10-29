import { createContext, useContext } from 'react';

export interface TelegramNotificationContextValue {
  messageHtml: string;
  buttonText: string;
}

export const TelegramNotificationContext =
  createContext<TelegramNotificationContextValue | null>(null);

export function useTelegramNotification() {
  const context = useContext(TelegramNotificationContext);
  if (!context) {
    throw new Error(
      'useTelegramNotification должен использоваться внутри TelegramNotificationProvider'
    );
  }
  return context;
}
