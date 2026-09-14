import { Box, Button, Flex, Heading, useToast } from '@chakra-ui/react';
import { SelectedUsersProvider, useSelectedUsers } from './Providers/SelectedUsers.provider';
import { FormEvent, memo, useEffect, useRef, useState } from 'react';
import { ArrowForwardIcon } from '@chakra-ui/icons/ArrowForward';
import { useNavigate } from 'react-router';
import { useFormsRegistry } from '../../molecules/Form/FormContext';
import SelectingRecipientAppProviderTest, {
  useSelectingRecipientAppTest,
} from './Providers/SelectingRecipientAppTest.provider';
import AllSelectBoxesTest from './AllSelectBoxesTest';
import ModalSend from '../Modals/ModalSend';
import { SendStatus } from '../types/types';

function SelectingRecipientAppTest({ isAuthorized }: { isAuthorized: boolean }) {
  return (
    <SelectingRecipientAppProviderTest>
      <SelectedUsersProvider>
        <PanelContent isAuthorized={isAuthorized} />
      </SelectedUsersProvider>
    </SelectingRecipientAppProviderTest>
  );
}

function PanelContent({ isAuthorized }: { isAuthorized: boolean }) {
  const navigate = useNavigate();
  const toast = useToast();
  const registry = useFormsRegistry();
  const { selectedApp, recipientsMode, setAppError, setRecipientsError } = useSelectingRecipientAppTest();
  const { selectedUsers } = useSelectedUsers();

  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<SendStatus>('confirm');
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const onAuthClick = () => navigate('/login');

  const recipientsCount =
    recipientsMode === 'all' ? selectedApp?.count ?? 0 : selectedUsers.length;

  const clearProgressInterval = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startProgress = () => {
    clearProgressInterval();
    setProgress(0);
    let current = 0;
    intervalRef.current = window.setInterval(() => {
      current = Math.min(current + 4, 90);
      setProgress(current);
    }, 120);
  };

  const finishProgress = () => {
    clearProgressInterval();
    setProgress(100);
  };

  // Шаг 1: валидация + открытие модалки подтверждения (данные ещё НЕ отправляются)
  const handleOpenModal = () => {
    setAppError(null);
    setRecipientsError(null);

    const contentStore = registry.getStore('pushNotification');
    const contentValid = contentStore?.validateAll() ?? false;

    let appValid = true;
    if (!selectedApp) {
      setAppError('Выберите приложение для отправки уведомления.');
      appValid = false;
    }

    let recipientsValid = true;
    if (recipientsMode === 'individual' && selectedUsers.length === 0) {
      setRecipientsError('Добавьте хотя бы одного получателя.');
      recipientsValid = false;
    }

    if (!contentValid || !appValid || !recipientsValid) {
      return;
    }

    setStatus('confirm');
    setProgress(0);
    setIsOpen(true);
  };

  const handleClose = () => {
    clearProgressInterval();
    setIsOpen(false);
    setStatus('confirm');
    setProgress(0);
  };

  // Шаг 2: имитация отправки — происходит только после подтверждения в модалке
  const handleConfirm = async () => {
    setStatus('loading');
    startProgress();

    const contentStore = registry.getStore('pushNotification');
    const contentValues = contentStore!.getValues();
    const payload = {
      title: contentValues.title,
      text: contentValues.text,
      buttonText: contentValues.buttonText,
      buttonLink: contentValues.buttonLink,
      app: selectedApp,
      recipientsMode,
      selectedUsers: recipientsMode === 'individual' ? selectedUsers : undefined,
    };

    try {
      // TODO: заменить на реальный вызов API отправки
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          // имитация случайной ошибки сети для проверки статуса "error" —
          // уберите этот блок, когда подключите реальный запрос
          const shouldFail = false;
          if (shouldFail) reject(new Error('Network error'));
          else resolve();
        }, 1200);
      });

      console.log('Отправка push-рассылки', payload);

      finishProgress();

      setTimeout(() => {
        setIsOpen(false);
        setStatus('confirm');
        setProgress(0);

        toast({
          position: 'bottom',
          duration: 4000,
          isClosable: true,
          render: () => (
            <Box bg="#1FAE4B" color="white" px={5} py={4} borderRadius="16px" boxShadow="lg" minW="470px">
              <Box fontWeight="700" mb={1}>
                Рассылка успешно отправлена
              </Box>
              <Box>Уведомление отправлено {recipientsCount} получателям</Box>
            </Box>
          ),
        });
      }, 300);
    } catch (error) {
      clearProgressInterval();
      setProgress(55);
      setStatus('error');
    }
  };

  useEffect(() => clearProgressInterval, []);

  return (
    <Box
      as="form"
      onSubmit={(e: FormEvent) => {
        e.preventDefault(); // не даём нативной форме перезагрузить страницу
        if (isAuthorized) handleOpenModal();
        else onAuthClick();
      }}
      maxW={{ base: '360px', xxl: '560px' }}
      w="100%"
      bg="white"
      px={6}
      py={5}
      borderLeft="1px solid"
      borderColor="gray.200"
      minH="calc(100vh - 73px)"
    >
      <Heading size="md" mb={6}>
        Настройка рассылки
      </Heading>
      <Flex direction="column" gap={3}>
        <AllSelectBoxesTest />
        <Button
          type="submit"
          bg="#3B6EA0"
          color="white"
          _hover={{ bg: '#2D547B' }}
          rightIcon={<ArrowForwardIcon />}
          borderRadius="12px"
          h="48px"
          px={5}
          fontWeight="600"
          maxW="fit-content"
          ml="auto"
        >
          {isAuthorized ? 'Отправить' : 'Авторизоваться для отправки'}
        </Button>
      </Flex>

      <ModalSend
        isOpen={isOpen}
        onClose={handleClose}
        status={status}
        progress={progress}
        onConfirm={handleConfirm}
        onRetry={handleConfirm}
        recipientsCount={recipientsCount}
      />
    </Box>
  );
}

export default memo(SelectingRecipientAppTest);