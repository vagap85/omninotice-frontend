import { useEffect, useMemo, useRef, useState } from 'react';

import BellRingIcon from '@/components/atoms/Icons/collections/Sigma/BellRingIcon';
import DropdownSelect from '@/components/molecules/DropdownSelect/DropdownSelect';
import type { ConnectedApp } from '@/api/vishenka';

import { useSelectingRecipientApp } from '../hooks/useSelectingRecipientApp';
import { mapToSelectedApp } from '../utils/mapToSelectedApp';
import type { AppSelectProps, SelectingApp } from '../types/types';

const DEFAULT_ICON_META = {
  id: 'Omni Notice',
  Icon: BellRingIcon,
  title: 'Стандартная иконка Omni Notice',
  description: 'Если не выбрать другую, получатель увидит эту'
};

const DEFAULT_ICON_COLOR = '#487BFE';
const DEFAULT_BG_ICON_COLOR = '#D1DEFF';

function mapToSelectingApp(app: ConnectedApp): SelectingApp {
  const standartIcon = app.standartIcon ?? {
    ...DEFAULT_ICON_META,
    Icon: app.icon?.Icon ?? BellRingIcon
  };

  return {
    id: app.id,
    name: app.name,
    count: app.count ?? 0,
    isActive: app.isActive ?? true,
    platform: app.platform ?? '',
    iconColor: app.iconColor ?? DEFAULT_ICON_COLOR,
    bgIconColor: app.bgIconColor ?? DEFAULT_BG_ICON_COLOR,
    standartIcon
  };
}

export default function AppSelect({
  apps: appsProp,
  value,
  onChange
}: AppSelectProps) {
  const [internalSelected, setInternalSelected] = useState<SelectingApp | null>(
    null
  );
  const { availableApps, setSelectedApp, appError } =
    useSelectingRecipientApp();

  const apps = useMemo<SelectingApp[]>(() => {
    if (appsProp && appsProp.length > 0) return appsProp;
    return availableApps.map(mapToSelectingApp);
  }, [appsProp, availableApps]);

  const selected = value !== undefined ? value : internalSelected;

  const handleSelect = (app: SelectingApp): void => {
    if (!app.isActive) return;
    if (value === undefined) setInternalSelected(app);

    // Конвертируем в ConnectedApp и передаём в общий маппер
    const connectedLike: ConnectedApp = {
      id: app.id,
      name: app.name,
      platform: app.platform,
      count: app.count,
      isActive: app.isActive,
      icon: app.standartIcon,
      standartIcon: app.standartIcon,
      iconColor: app.iconColor,
      bgIconColor: app.bgIconColor
    };

    setSelectedApp(mapToSelectedApp(connectedLike));
    onChange?.(app);
  };

  const handleSelectRef = useRef(handleSelect);
  useEffect(() => {
    handleSelectRef.current = handleSelect;
  });

  useEffect(() => {
    const onTourStepChange = (event: Event) => {
      const detail = (event as CustomEvent<{ targetSelector?: string }>).detail;
      if (detail?.targetSelector !== '[data-tour="app-select"]') return;

      const testApp = apps.find((app) => app.platform === 'OmniNoticeTest');
      if (testApp && testApp.isActive) handleSelectRef.current(testApp);
    };

    window.addEventListener('onboarding:tour-step-change', onTourStepChange);
    return () =>
      window.removeEventListener(
        'onboarding:tour-step-change',
        onTourStepChange
      );
  }, [apps]);

  return (
    <DropdownSelect
      label="Приложение"
      placeholder="Выберите приложение"
      value={selected?.id ?? null}
      options={apps.map((app) => ({
        id: app.id,
        label: app.name,
        count: app.count,
        isActive: app.isActive
      }))}
      error={appError ? 'Выбор приложение обязателен' : null}
      helperText="В этом списке отображаются все доступные вам приложения. Уведомление появится в выбранном приложении"
      dataTour="app-select"
      onSelect={(option) => {
        const app = apps.find((item) => item.id === option.id);
        if (app) handleSelect(app);
      }}
    />
  );
}
