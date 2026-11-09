import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
} from '@/api/vishenka';
import type { SelectedApp, SelectedAppIcon } from '../types/types';

import {
  SelectingRecipientAppContext,
  type RecipientsMode,
  type SelectingRecipientAppContextValue
} from '../Contexts/SelectingRecipientAppContext';

import { DEFAULT_TEST_APP } from '../constants/defaultTestApp';
import { COLLECTION_ICONS } from '../constants/collectionIcons';
import { getProjectUsers } from '@/api/userCenter';
import { ConnectedApp, ProjectUser } from '@/api/types';

const EMPTY_APPS: ConnectedApp[] = [];

interface ProviderProps {
  children: ReactNode;
  connectedApps?: ConnectedApp[];
}

export default function SelectingRecipientAppProviderTest({
  children,
  connectedApps = EMPTY_APPS
}: ProviderProps) {
  const [selectedApp, setSelectedAppState] = useState<SelectedApp | null>(null);
  const usersRequest = useRef<AbortController | null>(null);
  const [projectUsers, setProjectUsers] = useState<ProjectUser[]>([]);
  const [projectUsersLoaded, setProjectUsersLoaded] = useState(0);
  const [projectUsersTotal, setProjectUsersTotal] = useState<number | null>(
    null
  );
  const [isLoadingProjectUsers, setIsLoadingProjectUsers] = useState(false);
  const [projectUsersError, setProjectUsersError] = useState<string | null>(
    null
  );
  const [selectedIcon, setSelectedIcon] = useState<SelectedAppIcon>(
    COLLECTION_ICONS[0]
  );
  const [recipientsMode, setRecipientsMode] = useState<RecipientsMode>('all');
  const [appError, setAppError] = useState<string | null>(null);
  const [recipientsError, setRecipientsError] = useState<string | null>(null);
  const hasConnectedApps = connectedApps.length > 0;

  const setSelectedApp = useCallback(
    (app: SelectedApp | null) => {
      setSelectedAppState(app);
      usersRequest.current?.abort();

      if (!app || !hasConnectedApps) {
        setProjectUsers([]);
        setProjectUsersLoaded(0);
        setProjectUsersTotal(null);
        setIsLoadingProjectUsers(false);
        setProjectUsersError(null);
        return;
      }

      const controller = new AbortController();
      usersRequest.current = controller;
      setProjectUsers([]);
      setProjectUsersLoaded(0);
      setProjectUsersTotal(null);
      setIsLoadingProjectUsers(true);
      setProjectUsersError(null);

      getProjectUsers(app.project_id, controller.signal, (loaded, total) => {
        setProjectUsersLoaded(loaded);
        setProjectUsersTotal(total);
      })
        .then(setProjectUsers)
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          const message =
            error instanceof Error
              ? error.message
              : 'Не удалось загрузить пользователей приложения.';
          setProjectUsersError(message);
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsLoadingProjectUsers(false);
            usersRequest.current = null;
          }
        });
    },
    [hasConnectedApps]
  );

  useEffect(() => () => usersRequest.current?.abort(), []);

  const availableApps = useMemo<ConnectedApp[]>(() => {
    if (connectedApps.length > 0) {
      return connectedApps.filter((app) => app.project_id !== 'Omni Notice (Test)');
    }
    return [DEFAULT_TEST_APP];
  }, [connectedApps]);

  const value: SelectingRecipientAppContextValue = {
    selectedApp,
    setSelectedApp,
    projectUsers,
    projectUsersLoaded,
    projectUsersTotal,
    isLoadingProjectUsers,
    projectUsersError,
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
