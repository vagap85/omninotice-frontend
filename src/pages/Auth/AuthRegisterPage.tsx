import { useState } from 'react';
import { Box, Button, Link, Stack, Text, VStack, useToast } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import authBg from '@/assets/image 1.jpg';
import logo from '@/assets/Vector.svg';

import { FormsRegistryProvider, FormProvider, useFormsRegistry } from '@/components/molecules/Form/FormContext';
import { useFormValues } from '@/components/molecules/Form/hooks/useFormValues';
import { FormTextField } from '@/components/molecules/Form/Elements/FormTextField';
import { FormPasswordField } from '@/components/molecules/Form/Elements/FormPasswordField';
import {
  required,
  email as emailValidator,
  matchesField,
} from '@/components/molecules/Form/validators/validators';
import { useAuth } from '@/auth/AuthContext';
import { loginUserCenter } from '@/api/userCenter';

export default function AuthRegisterPage() {
  return (
    <FormsRegistryProvider>
      <FormProvider formId="register">
        <AuthRegisterPageInner />
      </FormProvider>
    </FormsRegistryProvider>
  );
}

function AuthRegisterPageInner() {
  const navigate = useNavigate();
  const toast = useToast();
  const registry = useFormsRegistry();
  const { login: setAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const store = registry.getOrCreateStore('register');
    if (!store.validateAll()) return;

    const { login, password } = store.getValues();

    setIsLoading(true);
    try {
      // Запрос сохранён как в оригинале: createUserCenter здесь не вызывается,
      // аккаунт логинится напрямую через loginUserCenter — поведение не меняю по вашей просьбе.
      const auth = await loginUserCenter(login.trim(), password);

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
              Вы успешно создали аккаунт
            </Text>
            <Text>Теперь можно отправлять рассылки и улучшать текст</Text>
          </Box>
        ),
      });
      navigate('/create/email');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ошибка авторизации';
      store.setFieldError('passwordConfirm', message);
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
                label="Придумайте пароль"
                placeholder="введите пароль"
                validators={[required('Введите логин и пароль')]}
              />
              <FormPasswordField
                name="passwordConfirm"
                label="Повторите пароль"
                placeholder="повторите пароль"
                validators={[required('Введите логин и пароль'), matchesField('password')]}
                onEnter={() => void handleSubmit()}
              />
            </Stack>

            <VStack spacing={1}>
              <RegisterSubmitButton isLoading={isLoading} onSubmit={() => void handleSubmit()} />
              <Link
                color="#3B6EA0"
                fontSize="16px"
                fontWeight="500"
                onClick={() => navigate('/login')}
                _hover={{ textDecoration: 'none', color: '#2D547B' }}
              >
                У меня уже есть аккаунт
              </Link>
            </VStack>
          </Stack>
        </Box>
      </VStack>
    </Box>
  );
}

function RegisterSubmitButton({ isLoading, onSubmit }: { isLoading: boolean; onSubmit: () => void }) {
  const values = useFormValues('register');
  const isFilled = Boolean(
    values.login?.trim() && values.password?.trim() && values.passwordConfirm?.trim()
  );

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