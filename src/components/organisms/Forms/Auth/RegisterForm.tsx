import { FormPasswordField } from '@/components/molecules/Form/Elements/FormPasswordField';
import { FormTextField } from '@/components/molecules/Form/Elements/FormTextField';
import {
  email,
  matchesField,
  required
} from '@/components/molecules/Form/validators/validators';
import { Stack } from '@chakra-ui/react';

export function RegisterForm({ onEnter }: { onEnter: () => void }) {
  return (
    <Stack spacing={5}>
      <FormTextField
        name="login"
        label="Логин"
        labelFontSize="14px"
        placeholder="example@omninotice"
        validators={[required('Введите логин'), email()]}
      />
      <FormPasswordField
        name="password"
        label="Придумайте пароль"
        placeholder="введите пароль"
        validators={[required('Введите пароль')]}
      />
      <FormPasswordField
        name="passwordConfirm"
        label="Повторите пароль"
        placeholder="повторите пароль"
        validators={[required('Введите пароль'), matchesField('password')]}
        onEnter={onEnter}
      />
    </Stack>
  );
}
