import { memo, useState } from 'react';
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useFormField } from '../hooks/useFormField';
import type { FormPasswordFieldProps } from '../../types/form';

function FormPasswordFieldBase({
  name,
  label,
  placeholder,
  initialValue,
  validators,
  onEnter,
}: FormPasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { value, error, onChange, onBlur } = useFormField<string>(name, { initialValue, validators });

  return (
    <FormControl isInvalid={Boolean(error)}>
      {label && (
        <FormLabel htmlFor={name} fontSize="14px" fontWeight="500" color="#12233F">
          {label}
        </FormLabel>
      )}
      <InputGroup>
        <Input
          id={name}
          h="48px"
          type={showPassword ? 'text' : 'password'}
          bg="#F8FAFC"
          borderRadius="10px"
          borderColor={error ? '#EF4444' : '#D1D5DB'}
          _hover={{ borderColor: error ? '#EF4444' : '#94A3B8' }}
          _focusVisible={{
            borderColor: error ? '#EF4444' : '#3B6EA0',
            boxShadow: '0 0 0 1px #3B6EA0',
          }}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onEnter?.();
          }}
        />
        <InputRightElement h="48px" pr={2}>
          <IconButton
            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
            size="sm"
            variant="ghost"
            color="#12233F"
            onClick={() => setShowPassword((v) => !v)}
          />
        </InputRightElement>
      </InputGroup>
      {error && (
        <FormErrorMessage mt={1} fontSize="12px">
          {error}
        </FormErrorMessage>
      )}
    </FormControl>
  );
}

export const FormPasswordField = memo(FormPasswordFieldBase);