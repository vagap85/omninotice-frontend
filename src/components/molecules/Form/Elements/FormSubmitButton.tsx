import { useState } from 'react';
import { Button } from '@chakra-ui/react';
import { useFormsRegistry } from '../FormContext';
import type { FormSubmitButtonProps } from '../../types/form';

export function FormSubmitButton({ formIds, onSubmit, children, ...rest }: FormSubmitButtonProps) {
  const registry = useFormsRegistry();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = async () => {
    const stores = formIds.map((id) => {
      const store = registry.getStore(id);
      if (!store) throw new Error(`Форма с id="${id}" ещё не смонтирована`);
      return store;
    });

    const allValid = stores.every((store) => store.validateAll());
    if (!allValid) return;

    // Внимание: если в разных формах есть поля с одинаковыми name — они перезапишут друг друга.
    // Если это возможно в вашем случае, лучше неймспейсить values по formId (см. вариант ниже).
    const mergedValues = stores.reduce((acc, store) => ({ ...acc, ...store.getValues() }), {});

    setIsSubmitting(true);
    try {
      await onSubmit(mergedValues);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button {...rest} isLoading={isSubmitting} onClick={handleClick}>
      {children}
    </Button>
  );
}