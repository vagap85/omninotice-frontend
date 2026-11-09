import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ConnectedApp } from '@/api/vishenka';
import type { SelectedApp, SelectedAppIcon } from '../types/types';

import {
  SelectingRecipientAppContext,
  type RecipientsMode,
  type SelectingRecipientAppContextValue
} from '../Contexts/SelectingRecipientAppContext';

import { DEFAULT_TEST_APP } from '../constants/defaultTestApp';
import { COLLECTION_ICONS } from '../constants/collectionIcons';

const EMPTY_APPS: ConnectedApp[] = [];

interface ProviderProps {
  children: ReactNode;
  connectedApps?: ConnectedApp[];
}

export default function SelectingRecipientAppProviderTest({
  children,
  connectedApps = EMPTY_APPS
}: ProviderProps) {
  const [selectedApp, setSelectedApp] = useState<SelectedApp | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<SelectedAppIcon>(
    COLLECTION_ICONS[0]
  );
  const [recipientsMode, setRecipientsMode] = useState<RecipientsMode>('all');
  const [appError, setAppError] = useState<string | null>(null);
  const [recipientsError, setRecipientsError] = useState<string | null>(null);

  const availableApps = useMemo<ConnectedApp[]>(() => {
    if (connectedApps.length > 0) {
      return connectedApps.filter((app) => app.platform !== 'OmniNoticeTest');
    }
    return [DEFAULT_TEST_APP];
  }, [connectedApps]);

  const value: SelectingRecipientAppContextValue = {
    selectedApp,
    setSelectedApp,
    selectedIcon,
    setSelectedIcon,
    recipientsMode,
    setRecipientsMode,
    appError,
    setAppError,
    recipientsError,
    setRecipientsError,
    connectedApps,
    availableApps
  };

  return (
    <SelectingRecipientAppContext.Provider value={value}>
      {children}
    </SelectingRecipientAppContext.Provider>
  );
}
