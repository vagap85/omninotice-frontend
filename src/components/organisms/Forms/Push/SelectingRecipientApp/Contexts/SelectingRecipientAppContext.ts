import { createContext } from 'react';
import type { ConnectedApp } from '@/api/vishenka';
import type { SelectedApp, SelectedAppIcon } from '../types/types';

export type RecipientsMode = 'all' | 'individual';

export interface SelectingRecipientAppContextValue {
  /** UI-готовая форма выбранного приложения (все поля заполнены). */
  selectedApp: SelectedApp | null;
  setSelectedApp: (app: SelectedApp | null) => void;
  selectedIcon: SelectedAppIcon;
  setSelectedIcon: (icon: SelectedAppIcon) => void;

  recipientsMode: RecipientsMode;
  setRecipientsMode: (mode: RecipientsMode) => void;

  appError: string | null;
  setAppError: (err: string | null) => void;
  recipientsError: string | null;
  setRecipientsError: (err: string | null) => void;

  connectedApps: ConnectedApp[];

  availableApps: ConnectedApp[];
}

export const SelectingRecipientAppContext =
  createContext<SelectingRecipientAppContextValue | null>(null);
