import { Button } from '@chakra-ui/react';
import { useState } from 'react';

import type { FormSubmitButtonProps } from '../../types/form';
import { useFormsRegistry } from '../hooks/useFormsRegistry';

export function FormSubmitButton({
  formIds,
  onSubmit,
  onUnauthorized,
  isAuthorized = true,
  beforeSubmitValidate,
  children,
  ...rest
}: FormSubmitButtonProps) {
  const registry = useFormsRegistry();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = async () => {
    if (!isAuthorized) {
      onUnauthorized?.();
      return;
    }

    const stores = formIds.map((id) => {
      const store = registry.getStore(id);
      if (!store) throw new Error(`Форма с id="${id}" ещё не смонтирована`);
      return store;
    });

    const storeResults = stores.map((store) => store.validateAll());
    const customValid = beforeSubmitValidate ? beforeSubmitValidate() : true;
    const allValid = storeResults.every(Boolean) && customValid;
    if (!allValid) return;

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