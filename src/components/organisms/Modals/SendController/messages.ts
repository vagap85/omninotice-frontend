import { pluralize } from '@/components/molecules/helpers/pluralize';

import type { SendMessages, SendVariant } from '../../types/types';

export const sendMessages: Record<SendVariant, SendMessages> = {
  email: {
    confirmMessage: (count) =>
      count === undefined
        ? 'Отправить письмо всем адресатам?'
        : `Отправить ${count} ${pluralize(count, ['письмо', 'письма', 'писем'])}?`,
    successMessage: (count) => ({
      title: 'Рассылка успешно отправлена',
      description:
        count === undefined
          ? 'Мы отправили письмо всем адресатам'
          : `Мы отправили ${pluralize(count, ['письмо', 'письма', 'писем'])} на ${count} ${pluralize(count, ['электронный адрес', 'электронных адреса', 'электронных адресов'])}`
    })
  },
  push: {
    confirmMessage: (count) =>
      count === undefined
        ? 'Отправить уведомление всем пользователям?'
        : `Отправить уведомление ${count} ${pluralize(count, ['получателю', 'получателям', 'получателям'])}?`,
    successMessage: (count) => ({
      title: 'Рассылка успешно отправлена',
      description:
        count === undefined
          ? 'Уведомление отправлено всем пользователям'
          : `Уведомление отправлено ${count} ${pluralize(count, ['получателю', 'получателям', 'получателям'])}`
    })
  },
  telegram: {
    confirmMessage: (count) =>
      count === undefined
        ? 'Отправить сообщение всем получателям?'
        : `Отправить ${count} ${pluralize(count, ['сообщение', 'сообщения', 'сообщений'])}?`,
    successMessage: (count) => ({
      title: 'Рассылка успешно отправлена',
      description:
        count === undefined
          ? 'Мы отправили сообщение всем получателям'
          : `Мы отправили ${count} ${pluralize(count, ['сообщение', 'сообщения', 'сообщений'])}`
    })
  }
};
