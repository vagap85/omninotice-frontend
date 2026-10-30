import { ArrowBackIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
  Text,
  VStack,
  useToast
} from '@chakra-ui/react';
import { useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import authBg from '@/assets/background.jpg';
import logo from '@/assets/logo.svg';
import { useAuth } from '@/auth/AuthContext';
import { ROUTES } from '@/routing/routes';
import { profileService } from '@/services/profile';

export default function AboutYourselfPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { authState, updateUser } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');

  const [nameError, setNameError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isFilled = Boolean(firstName.trim());

  const handleSubmit = async () => {
    if (!firstName.trim()) {
      setNameError('Введите имя');
      return;
    }

    setNameError('');
    setGeneralError('');
    setIsLoading(true);

    try {
      await profileService.saveProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        position: position.trim(),
        phone: phone.trim(),
        email: authState?.login || ''
      });

      updateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim()
      });

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
              Данные успешно сохранены
            </Text>
            <Text>Теперь можно отправлять рассылки и улучшать текст</Text>
          </Box>
        )
      });

      navigate(ROUTES.overview);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Ошибка при сохранении данных';
      setGeneralError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      void handleSubmit();
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
        onClick={() => navigate(ROUTES.home)}
        position="absolute"
        zIndex={2}
        top={{ base: '24px', md: '80px' }}
        left={{ base: 4, md: '80px' }}
      >
        На главную
      </Button>

      <VStack
        spacing={10}
        position="relative"
        zIndex={1}
        w="100%"
        maxW="460px"
        mx="auto"
        mt="8vh"
      >
        <Box
          as="img"
          src={logo}
          alt="OmniNotice"
          w="220px"
          h="80px"
        />

        <Box
          w="100%"
          bg="white"
          borderRadius="20px"
          boxShadow="0px 0px 1px rgba(25, 24, 27, 0.3), 0px 8px 16px rgba(26, 24, 27, 0.1)"
          p={8}
        >
          <Text
            fontSize="20px"
            fontWeight="700"
            color="#12233F"
            textAlign="center"
            mb={6}
          >
            Пожалуйста, расскажите о себе
          </Text>

          <Stack spacing={5}>
            <FormControl isInvalid={Boolean(nameError)}>
              <FormLabel
                fontSize="14px"
                fontWeight="500"
                color="#12233F"
                mb={2}
              >
                Имя <Text as="span" color="#EF4444">*</Text>
              </FormLabel>
              <Input
                h="48px"
                bg="#F8FAFC"
                borderRadius="10px"
                borderColor={nameError ? '#EF4444' : '#E2E8F0'}
                _hover={{ borderColor: nameError ? '#EF4444' : '#94A3B8' }}
                _focusVisible={{
                  borderColor: nameError ? '#EF4444' : '#3B6EA0',
                  boxShadow: '0 0 0 1px #3B6EA0'
                }}
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (nameError) setNameError('');
                }}
                onKeyDown={handleKeyDown}
                placeholder=""
              />
              {nameError && (
                <FormErrorMessage mt={1} fontSize="12px">
                  {nameError}
                </FormErrorMessage>
              )}
            </FormControl>

            <FormControl>
              <FormLabel
                fontSize="14px"
                fontWeight="500"
                color="#12233F"
                mb={2}
              >
                Фамилия
              </FormLabel>
              <Input
                h="48px"
                bg="#F8FAFC"
                borderRadius="10px"
                borderColor="#E2E8F0"
                _hover={{ borderColor: '#94A3B8' }}
                _focusVisible={{
                  borderColor: '#3B6EA0',
                  boxShadow: '0 0 0 1px #3B6EA0'
                }}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder=""
              />
            </FormControl>

            <FormControl>
              <FormLabel
                fontSize="14px"
                fontWeight="500"
                color="#12233F"
                mb={2}
              >
                Должность
              </FormLabel>
              <Input
                h="48px"
                bg="#F8FAFC"
                borderRadius="10px"
                borderColor="#E2E8F0"
                _hover={{ borderColor: '#94A3B8' }}
                _focusVisible={{
                  borderColor: '#3B6EA0',
                  boxShadow: '0 0 0 1px #3B6EA0'
                }}
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Например, Маркетолог"
                _placeholder={{ color: '#94A3B8' }}
              />
            </FormControl>

            <FormControl>
              <FormLabel
                fontSize="14px"
                fontWeight="500"
                color="#12233F"
                mb={2}
              >
                Номер телефона
              </FormLabel>
              <Input
                h="48px"
                bg="#F8FAFC"
                borderRadius="10px"
                borderColor="#E2E8F0"
                _hover={{ borderColor: '#94A3B8' }}
                _focusVisible={{
                  borderColor: '#3B6EA0',
                  boxShadow: '0 0 0 1px #3B6EA0'
                }}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="+7 999 999 99 99"
                _placeholder={{ color: '#94A3B8' }}
              />
              <Text
                fontSize="12px"
                color="#94A3B8"
                mt={1}
              >
                Код страны и номер
              </Text>
            </FormControl>

            {generalError && (
              <Text
                color="#EF4444"
                fontSize="13px"
                textAlign="center"
              >
                {generalError}
              </Text>
            )}

            <Button
              w="100%"
              h="49px"
              mt={2}
              borderRadius="12px"
              bg="#3B6EA0"
              maxW="none"
              _hover={{ bg: '#2D547B' }}
              color="#FAFAFA"
              fontSize="16px"
              fontWeight="500"
              onClick={() => void handleSubmit()}
              isLoading={isLoading}
              loadingText="Сохраняем данные..."
              opacity={isFilled ? 1 : 0.5}
            >
              Сохранить данные
            </Button>
          </Stack>
        </Box>
      </VStack>
    </Box>
  );
}
