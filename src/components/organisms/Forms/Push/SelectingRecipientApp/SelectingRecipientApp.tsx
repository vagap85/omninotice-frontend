import { ArrowForwardIcon } from '@chakra-ui/icons/ArrowForward';
import { Box, Button, Flex, Heading, useDisclosure } from '@chakra-ui/react';
import { FormEvent, memo, useState } from 'react';
import { useNavigate } from 'react-router';

import { useFormsRegistry } from '@/components/molecules/Form/hooks/useFormsRegistry';
import SendController from '@/components/organisms/Modals/SendController/SendController';
import type { PushPayload, PushNotificationFormValues } from '@/components/organisms/types/types';

import AllSelectBoxes from './AllSelectBoxes';
import { useSelectedUsers } from './hooks/useSelectedUsers';
import { useSelectingRecipientApp } from './hooks/useSelectingRecipientApp';
import { SelectedUsersProvider } from './Providers/SelectedUsers.provider';
import SelectingRecipientAppProviderTest from './Providers/SelectingRecipientApp.provider';

function SelectingRecipientApp({ isAuthorized }: { isAuthorized: boolean }) {
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
  const registry = useFormsRegistry();
  const { selectedApp, recipientsMode, setAppError, setRecipientsError } = useSelectingRecipientApp();
  const { selectedUsers } = useSelectedUsers();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // тестовый флаг — какой исход имитировать при следующей попытке отправки/повтора
  const [forceFail, setForceFail] = useState(false);

  const onAuthClick = () => navigate('/login');

  const recipientsCount =
    recipientsMode === 'all' ? selectedApp?.count ?? 0 : selectedUsers.length;

  const validate = (): boolean => {
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

    return contentValid && appValid && recipientsValid;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault(); // не даём нативной форме перезагрузить страницу
    if (!isAuthorized) {
      onAuthClick();
      return;
    }
    if (!validate()) return;

    setForceFail(false);
    onOpen();
  };

  const buildPayload = (): PushPayload => {
    const contentStore = registry.getStore('pushNotification');
    const contentValues = contentStore!.getValues<PushNotificationFormValues>();
    return {
      title: contentValues.title,
      text: contentValues.text,
      buttonText: contentValues.buttonText,
      buttonLink: contentValues.buttonLink,
      app: selectedApp,
      recipientsMode,
      selectedUsers: recipientsMode === 'individual' ? selectedUsers : undefined,
    };
  };

  const sendPushNotification = async (payload: PushPayload) => {
    // TODO: заменить на реальный вызов API отправки
    await new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // имитация исхода запроса для проверки статусов "error"/успех —
        // убрать forceFail и этот блок, когда будет реальный запрос
        if (forceFail) reject(new Error('Network error'));
        else resolve();
      }, 1200);
    });

    console.log('Отправка push-рассылки', payload);
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      maxW={{ base: "unset", md: '360px', xxl: '560px' }}
      p={
        {
          base: "clamp(12px, 1.7vw + 0.125rem, 24px)",
          md: "unset"
        }
      }
      borderLeft="1px solid"
      borderColor="gray.200"
      minH={{
        base: "unset",
        md: "calc(100vh - 73px)"
      }}
      w={"full"}
    >
      <Flex
        w="100%"
        h={"100%"}
        px={6}
        py={5}
        bg="white"
        flexDirection={"column"}
        borderRadius={
          {
            'base': "10px",
            'md': "none"
          }
        }
      >
        <Heading size="md" mb={6}>
          Настройка рассылки
        </Heading>
        <Flex
          direction="column"
          gap={3}
        >
          <AllSelectBoxes />
          <Button
            type="submit"
            bg="#3B6EA0"
            color="white"
            _hover={{ bg: '#2D547B' }}
            rightIcon={<ArrowForwardIcon />}
            borderRadius="12px"
            px={5}
            fontWeight="600"
            maxW="fit-content"
            ml="auto"
          >
            {isAuthorized ? 'Отправить' : 'Авторизоваться для отправки'}
          </Button>
        </Flex>
      </Flex>

      <SendController
        variant="push"
        isOpen={isOpen}
        onClose={onClose}
        recipientsCount={recipientsCount}
        getPayload={buildPayload}
        onSend={sendPushNotification}
      />
    </Box>
  );
}

export default memo(SelectingRecipientApp);