import { pluralize } from '@/components/molecules/helpers/pluralize';

import type { SendMessages, SendVariant } from '../../types/types';

export const sendMessages: Record<SendVariant, SendMessages> = {
  email: {
    confirmMessage: (count) =>
      `Отправить ${count} ${pluralize(count, ['письмо', 'письма', 'писем'])}?`,
    successMessage: (count) => ({
      title: 'Рассылка успешно отправлена',
      description: `Мы отправили ${pluralize(count, ['письмо', 'письма', 'письма'])} на ${count} ${pluralize(count, ['электронный адрес', 'электронных адреса', 'электронных адресов'])}`
    })
  },
  push: {
    confirmMessage: (count) =>
      `Отправить уведомление ${count} ${pluralize(count, ['получателю', 'получателям', 'получателям'])}?`,
    successMessage: (count) => ({
      title: 'Рассылка успешно отправлена',
      description: `Уведомление отправлено ${count} ${pluralize(count, ['получателю', 'получателям', 'получателям'])}`
    })
  },
  telegram: {
    confirmMessage: (count) =>
      `Отправить ${count} ${pluralize(count, ['сообщение', 'сообщения', 'сообщений'])}?`,
    successMessage: (count) => ({
      title: 'Рассылка успешно отправлена',
      description: `Мы отправили ${count} ${pluralize(count, ['сообщение', 'сообщения', 'сообщений'])}`
    })
  }
};
