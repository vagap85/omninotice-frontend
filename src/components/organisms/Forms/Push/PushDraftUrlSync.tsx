import { useEffect } from 'react';

import { useFormValues } from '@/components/molecules/Form/hooks/useFormValues';

import type { PushNotificationFormValues } from './types/types';

export default function PushDraftUrlSync() {
  const values = useFormValues<PushNotificationFormValues>('pushNotification');

  useEffect(() => {
    const next = new URLSearchParams(window.location.search);

    const setOrDelete = (key: string, value?: string) => {
      if (value) next.set(key, value);
      else next.delete(key);
    };

    setOrDelete('title', values.title);
    setOrDelete('text', values.text);
    setOrDelete('buttonText', values.buttonText);

    const newUrl = `${window.location.pathname}?${next.toString()}${window.location.hash}`;

    // Меняем URL напрямую через History API, МИНУЯ react-router.
    // Это не уведомляет Router о смене location, поэтому не триггерит
    // ре-рендер всего дерева <Routes> — только сама адресная строка обновляется.
    window.history.replaceState(window.history.state, '', newUrl);
  }, [values]);

  return null;
}