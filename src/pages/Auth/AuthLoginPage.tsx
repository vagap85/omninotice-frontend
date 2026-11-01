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

import { fetchMyProfile } from '@/api/profile';
import { loginUserCenter } from '@/api/userCenter';
import { useAuth } from '@/auth/AuthContext';
import { useFormsRegistry } from '@/components/molecules/Form/hooks/useFormsRegistry';
import { useFormSelector } from '@/components/molecules/Form/hooks/useFormValues';
import { FormProvider } from '@/components/molecules/Form/Providers/FormProvider';
import LoginForm from '@/components/organisms/Forms/Auth/LoginForm';
import { getAuthRedirectPath } from '@/routing/authRedirect';
import { ROUTES } from '@/routing/routes';

type LoginValues = {
  login: string;
  password: string;
};

const isLoginFormFilled = (values: LoginValues) =>
  Boolean(values.login?.trim() && values.password?.trim());

export default function AuthLoginPage() {
  return (
    <FormProvider formId="login">
      <AuthLoginPageContent />
    </FormProvider>
  );
}

function AuthLoginPageContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const registry = useFormsRegistry();
  const { login: setAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const redirectTo = getAuthRedirectPath(location.state);

  const handleSubmit = async () => {
    const store = registry.getOrCreateStore('login');
    if (!store.validateAll()) return;

    const { login, password } = store.getValues<{
      login: string;
      password: string;
    }>();

    setIsLoading(true);
    try {
      const auth = await loginUserCenter(login.trim(), password);
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
              Вы успешно вошли
            </Text>
            <Text>Теперь можно отправлять рассылки и улучшать текст</Text>
          </Box>
        )
      });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Ошибка авторизации';
      store.setFieldError('password', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack spacing={6}>
      <LoginForm onEnter={() => void handleSubmit()} />
      <VStack spacing={1}>
        <LoginSubmitButton
          isLoading={isLoading}
          onSubmit={() => void handleSubmit()}
        />
        <Link
          as="button"
          type="button"
          color="#3B6EA0"
          fontSize="16px"
          fontWeight="500"
          onClick={() =>
            navigate(ROUTES.registration, { state: location.state })
          }
          _hover={{ textDecoration: 'none', color: '#2D547B' }}
        >
          Нет аккаунта? Зарегистрируйтесь
        </Link>
      </VStack>
    </Stack>
  );
}

function LoginSubmitButton({
  isLoading,
  onSubmit
}: {
  isLoading: boolean;
  onSubmit: () => void;
}) {
  const isFilled = useFormSelector('login', isLoginFormFilled);

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
      loadingText="Входим..."
      opacity={isFilled ? 1 : 0.5}
      disabled={!isFilled}
    >
      Войти
    </Button>
  );
}
