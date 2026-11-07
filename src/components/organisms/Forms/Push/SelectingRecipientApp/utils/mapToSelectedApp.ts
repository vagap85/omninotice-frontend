import type { ConnectedApp } from '@/api/vishenka';
import { DEFAULT_ICON_COLOR } from '../constants/iconColors';
import type { SelectedApp } from '../types/types';

const DEFAULT_ICON_META = {
  id: 'Omni Notice',
  path: 'collections/bell-ring-icon.svg',
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
    ...DEFAULT_ICON_META
  };

  return {
    id: app.id,
    name: app.name,
    title: app.title ?? app.name,
    description: app.description ?? DEFAULT_DESCRIPTION,
    icon: standartIcon,
    standartIcon,
    iconColor: app.iconColor ?? DEFAULT_ICON_COLOR,
    bgIconColor: app.bgIconColor,
    count: app.count ?? 0,
    platform: app.platform ?? '',
    isActive: app.isActive ?? true
  };
}
