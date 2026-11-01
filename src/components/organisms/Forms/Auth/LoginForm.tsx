import { FormPasswordField } from '@/components/molecules/Form/Elements/FormPasswordField';
import { FormTextField } from '@/components/molecules/Form/Elements/FormTextField';
import {
  email,
  required
} from '@/components/molecules/Form/validators/validators';
import { Flex, Stack } from '@chakra-ui/react';

export default function LoginForm({ onEnter }: { onEnter?: () => void }) {
  return (
    <Stack spacing={5}>
      <Flex flexDirection={'column'}>
        <FormTextField
          label="Логин"
          labelFontSize={'14px'}
          id="login"
          name="login"
          placeholder="example@omninotice"
          validators={[required('Введите логин'), email()]}
        />
      </Flex>
      <FormPasswordField
        name="password"
        label="Пароль"
        placeholder="введите пароль"
        validators={[required('Введите пароль')]}
        onEnter={onEnter}
      />
    </Stack>
  );
}
