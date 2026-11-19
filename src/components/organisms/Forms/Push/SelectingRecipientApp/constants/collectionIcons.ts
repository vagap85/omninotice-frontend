import type { SelectedAppIcon } from '../types/types';

export const COLLECTION_ICONS = [
  {
    id: '0',
    path: 'collections/bell-ring-icon.svg',
    title: 'Стандартная',
    description: 'Если не выбрать другую, получатель увидит эту'
  },
  {
    id: '1',
    path: 'collections/calendar-date-icon.svg',
    title: 'Дата и срок',
    description: 'Отпуск, встреча, дедлайн, начало и конец периода'
  },
  {
    id: '2',
    path: 'collections/check-icon.svg',
    title: 'Готово',
    description: 'Согласовано, завершено, заявка одобрена'
  },
  {
    id: '3',
    path: 'collections/information-icon.svg',
    title: 'Важное',
    description: 'Требует действия или внимания в срок'
  },
  {
    id: '4',
    path: 'collections/about-icon.svg',
    title: 'Справка',
    description: 'Регламент, инструкция, изменение правил'
  },
  {
    id: '5',
    path: 'collections/user-icon.svg',
    title: 'Сотрудник',
    description: 'Новый человек, назначение, изменение роли'
  },
  {
    id: '6',
    path: 'collections/folder-closed-icon.svg',
    title: 'Проект',
    description: 'Команда, доступ, подключение к проекту'
  },
  {
    id: '7',
    path: 'collections/pie-chart-icon.svg',
    title: 'Отчет',
    description: 'Результаты опроса, аналитика, показатели'
  },
  {
    id: '8',
    path: 'collections/envelope-icon.svg',
    title: 'Сообщение',
    description: 'Личное обращение, приглашение, ответ'
  },
  {
    id: '9',
    path: 'collections/settings-icon.svg',
    title: 'Система',
    description: 'Обновления, работы, техническое'
  },
  {
    id: '10',
    path: 'collections/party-icon.svg',
    title: 'Праздники',
    description: 'Поздравление, новость, анонс'
  }
] satisfies [SelectedAppIcon, ...SelectedAppIcon[]];