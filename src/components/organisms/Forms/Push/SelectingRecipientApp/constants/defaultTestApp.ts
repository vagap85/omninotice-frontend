import type { ConnectedApp } from '@/api/vishenka';

import { DEFAULT_ICON_COLOR } from './iconColors';

/**
 * Тестовое "приложение" для предпросмотра уведомления без реальной отправки.
 * Используется, если у пользователя нет ни одного подключённого сервиса.
 */
export const DEFAULT_TEST_APP: ConnectedApp = {
  id: 'sigma',
  name: 'Omni Notice (Test)',
  platform: 'OmniNoticeTest',
  count: 1,
  isActive: true,
  iconColor: DEFAULT_ICON_COLOR
};
