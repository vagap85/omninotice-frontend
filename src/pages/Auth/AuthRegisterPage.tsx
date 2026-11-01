import {
  Box,
  Button,
  Link,
  Stack,
  Text,
  VStack,
  useToast
} from '@chakra-ui/react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { createUserCenter, loginUserCenter } from '@/api/userCenter';
import { useAuth } from '@/auth/AuthContext';
import { useFormsRegistry } from '@/components/molecules/Form/hooks/useFormsRegistry';
import { useFormSelector } from '@/components/molecules/Form/hooks/useFormValues';
import { FormProvider } from '@/components/molecules/Form/Providers/FormProvider';
import { RegisterForm } from '@/components/organisms/Forms/Auth/RegisterForm';
import { ROUTES } from '@/routing/routes';

type RegisterValues = {
  login: string;
  password: string;
  passwordConfirm: string;
};

const isRegisterFormFilled = (values: RegisterValues) =>
  Boolean(
    values.login?.trim() &&
    values.password?.trim() &&
    values.passwordConfirm?.trim()
  );

export default function AuthRegisterPage() {
  return (
    <FormProvider formId="register">
      <AuthRegisterPageContent />
    </FormProvider>
  );
}

function AuthRegisterPageContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const registry = useFormsRegistry();
  const { login: setAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const store = registry.getOrCreateStore('register');
    if (!store.validateAll()) return;

    const { login, password } = store.getValues<{
      login: string;
      password: string;
    }>();

    setIsLoading(true);
    try {
      const trimmedLogin = login.trim();
      await createUserCenter(trimmedLogin, password);
      const auth = await loginUserCenter(trimmedLogin, password);
      setAuth(auth);
      toast({
        position: 'bottom',
        duration: 4000,
        isClosable: true,
        render: () => (
          <Box
            bg="#1FAE4B"
            color="white"
            px={5}
            py={4}
            borderRadius="16px"
            boxShadow="lg"
            minW="470px"
          >
            <Text
              fontWeight="700"
              mb={1}
            >
              Вы успешно создали аккаунт
            </Text>
            <Text>Теперь можно отправлять рассылки и улучшать текст</Text>
          </Box>
        )
      });
      navigate(ROUTES.about, { state: location.state });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Ошибка авторизации';
      store.setFieldError('passwordConfirm', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack spacing={6}>
      <RegisterForm onEnter={() => void handleSubmit()} />
      <VStack spacing={1}>
        <RegisterSubmitButton
          isLoading={isLoading}
          onSubmit={() => void handleSubmit()}
        />
        <Link
          as="button"
          type="button"
          color="#3B6EA0"
          fontSize="16px"
          fontWeight="500"
          onClick={() => navigate(ROUTES.login)}
          _hover={{ textDecoration: 'none', color: '#2D547B' }}
        >
          У меня уже есть аккаунт
        </Link>
      </VStack>
    </Stack>
  );
}

function RegisterSubmitButton({
  isLoading,
  onSubmit
}: {
  isLoading: boolean;
  onSubmit: () => void;
}) {
  const isFilled = useFormSelector('register', isRegisterFormFilled);

  return (
    <Button
      w="100%"
      h="49px"
      borderRadius="12px"
      bg="#3B6EA0"
      _hover={{ bg: '#2D547B' }}
      color="#FAFAFA"
      fontSize="16px"
      fontWeight="500"
      onClick={onSubmit}
      isLoading={isLoading}
      loadingText="Создаем аккаунт..."
      opacity={isFilled ? 1 : 0.5}
    >
      Создать аккаунт
    </Button>
  );
}
