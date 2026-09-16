import { ArrowBackIcon } from '@chakra-ui/icons';
import { Box, Button, Link, Stack, Text, VStack, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { loginUserCenter } from '@/api/userCenter';
import authBg from '@/assets/image 1.jpg';
import logo from '@/assets/Vector.svg';
import { useAuth } from '@/auth/AuthContext';
import { FormPasswordField } from '@/components/molecules/Form/Elements/FormPasswordField';
import { FormTextField } from '@/components/molecules/Form/Elements/FormTextField';
import { useFormsRegistry } from '@/components/molecules/Form/hooks/useFormsRegistry';
import { useFormValues } from '@/components/molecules/Form/hooks/useFormValues';
import { FormProvider } from '@/components/molecules/Form/Providers/FormProvider';
import { FormsRegistryProvider } from '@/components/molecules/Form/Providers/FormsRegistryProvider';
import { required, email as emailValidator } from '@/components/molecules/Form/validators/validators';

export default function AuthLoginPage() {
  return (
    <FormsRegistryProvider>
      <FormProvider formId="login">
        <AuthLoginPageInner />
      </FormProvider>
    </FormsRegistryProvider>
  );
}

function AuthLoginPageInner() {
  const navigate = useNavigate();
  const toast = useToast();
  const registry = useFormsRegistry();
  const { login: setAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const store = registry.getOrCreateStore('login');
    if (!store.validateAll()) return;

    const { login, password } = store.getValues<{ login: string; password: string }>();

    setIsLoading(true);
    try {
      const auth = await loginUserCenter(login.trim(), password);

      // Глобальное состояние всего приложения обновляется здесь —
      // любой компонент, подписанный на useAuth(), тут же увидит isAuthorized === true
      setAuth({
        accessToken: auth.accessToken,
        tokenType: auth.tokenType,
        login: auth.login,
        firstName: auth.firstName,
        lastName: auth.lastName,
      });

      toast({
        position: 'bottom',
        duration: 4000,
        isClosable: true,
        render: () => (
          <Box bg="#1FAE4B" color="white" px={5} py={4} borderRadius="16px" boxShadow="lg" minW="470px">
            <Text fontWeight="700" mb={1}>
              Вы успешно вошли
            </Text>
            <Text>Теперь можно отправлять рассылки и улучшать текст</Text>
          </Box>
        ),
      });
      navigate('/create/email');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ошибка авторизации';
      store.setFieldError('password', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      position="relative"
      w="100%"
      minH="100vh"
      sx={{ '@supports (min-height: 100dvh)': { minHeight: '100dvh' } }}
      overflowX="hidden"
      px={{ base: 4, sm: 6 }}
      py={{ base: 16, md: 20 }}
      fontFamily="Inter, system-ui, sans-serif"
    >
      <Box
        aria-hidden
        position="absolute"
        inset={0}
        zIndex={0}
        bgImage={`url("${authBg}")`}
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
        minW="100%"
        minH="100%"
      />
      <Button
        variant="ghost"
        leftIcon={<ArrowBackIcon />}
        color="#2D547B"
        fontWeight="500"
        fontSize="16px"
        onClick={() => navigate('/')}
        position="absolute"
        zIndex={2}
        top={{ base: '24px', md: '80px' }}
        left={{ base: 4, md: '80px' }}
      >
        На главную
      </Button>

      <VStack spacing={10} position="relative" zIndex={1} w="100%" maxW="460px" mx="auto" mt="8vh">
        <Box as="img" src={logo} alt="OmniNotice" w="220px" h="80px" />

        <Box
          w="100%"
          bg="white"
          borderRadius="20px"
          boxShadow="0px 0px 1px rgba(25, 24, 27, 0.3), 0px 8px 16px rgba(26, 24, 27, 0.1)"
          p={8}
        >
          <Stack spacing={6}>
            <Stack spacing={5}>
              <FormTextField
                name="login"
                label="Логин"
                placeholder="example@omninotice"
                validators={[required('Введите логин и пароль'), emailValidator()]}
              />
              <FormPasswordField
                name="password"
                label="Пароль"
                placeholder="введите пароль"
                validators={[required('Введите логин и пароль')]}
                onEnter={() => void handleSubmit()}
              />
            </Stack>

            <VStack spacing={1}>
              <LoginSubmitButton isLoading={isLoading} onSubmit={() => void handleSubmit()} />
              <Link
                color="#3B6EA0"
                fontSize="16px"
                fontWeight="500"
                onClick={() => navigate('/registration')}
                _hover={{ textDecoration: 'none', color: '#2D547B' }}
              >
                Нет аккаунта? Зарегистрируйтесь
              </Link>
            </VStack>
          </Stack>
        </Box>

        <Text color="#2D547B" fontSize="14px" fontWeight="500">
          Не помню пароль
        </Text>
      </VStack>
    </Box>
  );
}

// Вынесено в лист, чтобы useFormValues (подписка на ВСЕ поля формы, нужная только
// для расчёта opacity) не тянула за собой ре-рендер всей страницы при каждом нажатии клавиши.
function LoginSubmitButton({ isLoading, onSubmit }: { isLoading: boolean; onSubmit: () => void }) {
  const values = useFormValues<{ login: string; password: string }>('login');
  const isFilled = Boolean(values.login?.trim() && values.password?.trim());

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
    >
      Войти
    </Button>
  );
}