import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { IconButton } from '@chakra-ui/react';
import { memo, useState } from 'react';

import type { FormPasswordFieldProps } from '../../types/form';
import { FormTextField } from './FormTextField';

function FormPasswordFieldBase({
  name,
  label,
  initialValue,
  validators,
  onEnter,
  onKeyDown,
  ...rest
}: FormPasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormTextField
      name={name}
      label={label}
      labelFontSize={"14px"}
      initialValue={initialValue}
      validators={validators}
      h="48px"
      bg="#F8FAFC"
      type={showPassword ? 'text' : 'password'}
      {...rest}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.key === 'Enter' && !event.defaultPrevented) onEnter?.();
      }}
      rightElement={
        <IconButton
          type="button"
          aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
          size="sm"
          variant="ghost"
          color="#12233F"
          onClick={() => setShowPassword((v) => !v)}
          onMouseDown={(event) => event.preventDefault()}
        />
      }
    />
  );
}

export const FormPasswordField = memo(FormPasswordFieldBase);
