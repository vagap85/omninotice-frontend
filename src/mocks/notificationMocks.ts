import { NotificationLog } from '@/components/organisms/types/types';

const generateRecipients = (count: number) =>
  Array.from({ length: count }, (_, i) => `user_${i}`);

export const MOCK_DATA: NotificationLog[] = [
  {
    event_id: 'evt_001',
    application_id: 'sigma',
    channel: 'popup',
    send_method: 'manual',
    title: 'Напоминание о задаче',
    body: 'Привет, Илья! Напоминаем о задаче «История отправки push-уведомлений». Если всё в порядке, просмотри статус задачи и обнови его при необходимости.',
    audience_type: 'all',
    recipients: generateRecipients(180),
    account_id: 'none',
    created_at: '2026-07-12T16:30:00Z',
    status: 'sent',
    template_name: 'Напоминание о задаче'
  },
  {
    event_id: 'evt_002',
    application_id: 'sigma',
    channel: 'popup',
    send_method: 'triggered',
    title: 'Срочное обновление',
    body: 'Внимание! Запланировано техническое обслуживание серверов.',
    audience_type: 'all',
    recipients: [],
    account_id: 'none',
    created_at: '2026-07-12T15:45:00Z',
    status: 'error',
    template_name: 'Без шаблона'
  },
  {
    event_id: 'evt_003',
    application_id: 'raida',
    channel: 'popup',
    send_method: 'manual',
    title: 'Новые функции в личном кабинете',
    body: 'Мы добавили темную тему и улучшили навигацию.',
    audience_type: 'all',
    recipients: generateRecipients(180),
    account_id: 'none',
    created_at: '2026-07-10T14:20:00Z', // 2 дня назад (в пределах 7 дней)
    status: 'sent',
    template_name: 'Без шаблона'
  },
  {
    event_id: 'evt_004',
    application_id: 'raida',
    channel: 'popup',
    send_method: 'triggered',
    title: 'Напоминание о задаче',
    body: 'Привет, Илья! Напоминаем о задаче «История отправки push-уведомлений»...',
    audience_type: 'all',
    recipients: [],
    account_id: 'none',
    created_at: '2026-07-02T12:00:00Z', // 10 дней назад (в пределах 30 дней, но не 7)
    status: 'error',
    template_name: 'Напоминание о задаче'
  },
  {
    event_id: 'evt_005',
    application_id: 'sigma',
    channel: 'popup',
    send_method: 'manual',
    title: 'Еженедельный дайджест',
    body: 'Ваша статистика за прошедшую неделю готова.',
    audience_type: 'group',
    recipients: generateRecipients(45),
    account_id: 'none',
    created_at: '2026-06-20T10:15:00Z', // 22 дня назад (в пределах 30 дней)
    status: 'sent',
    template_name: 'Дайджест'
  },
  {
    event_id: 'evt_006',
    application_id: 'raida',
    channel: 'popup',
    send_method: 'triggered',
    title: 'Напоминание о задаче',
    body: 'Не забудьте закрыть задачи до конца дня.',
    audience_type: 'all',
    recipients: generateRecipients(180),
    account_id: 'none',
    created_at: '2026-05-10T18:00:00Z', // Более 30 дней назад
    status: 'sent',
    template_name: 'Напоминание о задаче'
  },
  {
    event_id: 'evt_007',
    application_id: 'sigma',
    channel: 'popup',
    send_method: 'manual',
    title: 'Ошибка интеграции',
    body: 'Не удалось отправить уведомление из-за таймаута API.',
    audience_type: 'all',
    recipients: [],
    account_id: 'none',
    created_at: '2026-05-05T16:30:00Z', // Более 30 дней назад
    status: 'error',
    template_name: 'Без шаблона'
  },
  {
    event_id: 'evt_008',
    application_id: 'raida',
    channel: 'popup',
    send_method: 'triggered',
    title: 'Запрос на отпуск',
    body: 'Ваш запрос на отпуск был одобрен руководителем.',
    audience_type: 'individual',
    recipients: generateRecipients(1),
    account_id: 'none',
    created_at: '2026-04-15T11:20:00Z',
    status: 'sent',
    template_name: 'Уведомления HR'
  }
];
