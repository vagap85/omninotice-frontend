import { useEffect, useMemo, useRef, useState } from 'react';

import DropdownSelect from '@/components/molecules/DropdownSelect/DropdownSelect';
import type { ConnectedApp } from '@/api/vishenka';

import { useSelectingRecipientApp } from '../hooks/useSelectingRecipientApp';
import { mapToSelectedApp } from '../utils/mapToSelectedApp';
import type { AppSelectProps, SelectingApp } from '../types/types';

function mapToSelectingApp(app: ConnectedApp): SelectingApp {
  return {
    project_id: app.project_id,
    title: app.title,
    color: app.color
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
    if (value === undefined) setInternalSelected(app);

    // Передаем выбранное приложение в стейт
    setSelectedApp(mapToSelectedApp(app as unknown as ConnectedApp));
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

      // Ищем тестовое приложение по title (так как platform убрали)
      const testApp = apps.find((app) => app.title === 'OmniNoticeTest');
      if (testApp) handleSelectRef.current(testApp);
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
      value={selected?.project_id ?? null}
      options={apps.map((app) => ({
        id: app.project_id,
        label: app.title
      }))}
      error={appError ? 'Выбор приложения обязателен' : null}
      helperText="В этом списке отображаются все доступные вам приложения. Уведомление появится в выбранном приложении"
      dataTour="app-select"
      onSelect={(option) => {
        const app = apps.find((item) => item.project_id === option.id);
        if (app) handleSelect(app);
      }}
    />
  );
}
