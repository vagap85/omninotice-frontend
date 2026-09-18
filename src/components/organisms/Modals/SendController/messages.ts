import { pluralize } from '@/components/molecules/helpers/pluralize';

import type { SendMessages, SendVariant } from '../../types/types';

export const sendMessages: Record<SendVariant, SendMessages> = {
    email: {
        confirmMessage: (count) =>
            `Отправить ${count} ${pluralize(count, ['письмо', 'письма', 'писем'])}?`,
        successMessage: (count) => ({
            title: 'Рассылка успешно отправлена',
            description: `Мы отправили письма на ${count} электронных адресов`,
        }),
    },
    push: {
        confirmMessage: (count) =>
            `Отправить уведомление ${count} ${pluralize(count, ['получателю', 'получателям', 'получателям'])}?`,
        successMessage: (count) => ({
            title: 'Рассылка успешно отправлена',
            description: `Уведомление отправлено ${count} получателям`,
        }),
    },
};