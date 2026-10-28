import { useEffect, useRef, useState } from 'react';

import BellRingIcon from '@/components/atoms/Icons/collections/Sigma/BellRingIcon';
import DropdownSelect from '@/components/molecules/DropdownSelect/DropdownSelect';

import { useSelectingRecipientApp } from '../hooks/useSelectingRecipientApp';
import type { AppSelectProps, SelectingApp } from '../types/types';

const DEFAULT_APPS: SelectingApp[] = [
  {
    id: 'test',
    name: 'Omni Notice (Test)',
    count: 1,
    isActive: true,
    platform: 'OmniNoticeTest',
    iconColor: '#487BFE',
    bgIconColor: '#D1DEFF',
    standartIcon: {
      id: 'Omni Notice',
      Icon: BellRingIcon,
      title: 'Стандартная иконка Omni Notice',
      description: 'Если не выбрать другую, получатель увидит эту'
    }
  },
  {
    id: 'focus',
    name: 'Фокус',
    count: 1,
    isActive: true,
    platform: 'Focus',
    iconColor: '#487BFE',
    bgIconColor: '#D1DEFF',
    standartIcon: {
      id: 'focus',
      Icon: BellRingIcon,
      title: 'Стандартная иконка Omni Notice',
      description: 'Если не выбрать другую, получатель увидит эту'
    }
  },
];

export default function AppSelect({
  apps = DEFAULT_APPS,
  value,
  onChange
}: AppSelectProps) {
  const [internalSelected, setInternalSelected] = useState<SelectingApp | null>(
    null
  );
  const { setSelectedApp, appError } = useSelectingRecipientApp();

  const selected = value !== undefined ? value : internalSelected;

  const handleSelect = (app: SelectingApp): void => {
    if (!app.isActive) return;
    if (value === undefined) setInternalSelected(app);
    setSelectedApp({
      title: app.name,
      description: 'Если не выбрать другую, получатель увидит эту',
      icon: app.standartIcon,
      standartIcon: app.standartIcon,
      iconColor: app.iconColor,
      bgIconColor: app.bgIconColor,
      count: app.count,
      platform: app.platform
    });
    onChange?.(app);
  };

  const handleSelectRef = useRef(handleSelect);

  useEffect(() => {
    handleSelectRef.current = handleSelect;
  });

  useEffect(() => {
    const onTourStepChange = (event: Event) => {
      const detail = (
        event as CustomEvent<{
          stepId?: number;
          targetSelector?: string;
        }>
      ).detail;

      if (detail?.targetSelector !== '[data-tour="app-select"]') return;

      const testApp = apps.find((app) => app.platform === 'OmniNoticeTest');
      if (testApp && testApp.isActive) {
        handleSelectRef.current(testApp);
      }
    };

    window.addEventListener('onboarding:tour-step-change', onTourStepChange);
    return () => {
      window.removeEventListener(
        'onboarding:tour-step-change',
        onTourStepChange
      );
    };
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
