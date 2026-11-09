import type { ConnectedApp } from '@/api/types';

import { DEFAULT_ICON_COLOR } from './iconColors';

/**
 * Тестовое "приложение" для предпросмотра уведомления без реальной отправки.
 * Используется, если у пользователя нет ни одного подключённого сервиса.
 */
export const DEFAULT_TEST_APP: ConnectedApp = {
  project_id: 'Omni Notice (Test)',
  title: 'Omni Notice (Test)',
  color: DEFAULT_ICON_COLOR
};
