import BellRingIcon from '@/components/atoms/Icons/collections/Sigma/BellRingIcon';
import type { ConnectedApp } from '@/api/vishenka';
import type { SelectedApp } from '../types/types';

const DEFAULT_ICON_META = {
  id: 'Omni Notice',
  Icon: BellRingIcon,
  title: 'Стандартная иконка Omni Notice',
  description: 'Если не выбрать другую, получатель увидит эту'
};

const DEFAULT_DESCRIPTION = 'Если не выбрать другую, получатель увидит эту';

/**
 * Приводит приложение из API (ConnectedApp) к UI-готовой форме (SelectedApp),
 * заполняя недостающие поля дефолтами.
 */
export function mapToSelectedApp(app: ConnectedApp): SelectedApp {
  const standartIcon = app.standartIcon ?? {
    ...DEFAULT_ICON_META,
    Icon: app.icon?.Icon ?? BellRingIcon
  };

  return {
    id: app.id,
    name: app.name,
    title: app.title ?? app.name,
    description: app.description ?? DEFAULT_DESCRIPTION,
    icon: standartIcon,
    standartIcon,
    iconColor: app.iconColor ?? '#487BFE',
    bgIconColor: app.bgIconColor ?? '#D1DEFF',
    count: app.count ?? 0,
    platform: app.platform ?? '',
    isActive: app.isActive ?? true
  } as SelectedApp;
}
