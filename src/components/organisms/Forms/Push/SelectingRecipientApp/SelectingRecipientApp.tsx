import { ArrowForwardIcon } from '@chakra-ui/icons/ArrowForward';
import { Box, Flex, Heading, useDisclosure } from '@chakra-ui/react';
import { memo, useState } from 'react';
import { useNavigate } from 'react-router';

import { FormSubmitButton } from '@/components/molecules/Form/Elements/FormSubmitButton';
import { useFormsRegistry } from '@/components/molecules/Form/hooks/useFormsRegistry';
import SendController from '@/components/organisms/Modals/SendController/SendController';
import type { PushPayload, PushNotificationFormValues } from '@/components/organisms/types/types';
import { sanitizeSubmitValue } from '@/utils/sanitizeSubmitValue';

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

  const [forceFail, setForceFail] = useState(false);

  const onAuthClick = () => navigate('/login');

  const recipientsCount =
    recipientsMode === 'all' ? selectedApp?.count ?? 0 : selectedUsers.length;

  // теперь проверяет только то, что вне зоны ответственности formIds
  // (валидацию самого контента формы pushNotification уже сделает FormSubmitButton)
  const validateExtraFields = (): boolean => {
    setAppError(null);
    setRecipientsError(null);

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

    return appValid && recipientsValid;
  };

  const buildPayload = (): PushPayload => {
    const contentStore = registry.getStore('pushNotification');
    const contentValues = contentStore!.getValues<PushNotificationFormValues>();
    return {
      title: sanitizeSubmitValue(contentValues.title),
      text: sanitizeSubmitValue(contentValues.text),
      buttonText: sanitizeSubmitValue(contentValues.buttonText),
      buttonLink: contentValues.buttonLink,
      app: selectedApp,
      recipientsMode,
      selectedUsers: recipientsMode === 'individual' ? selectedUsers : undefined,
    };
  };

  const sendPushNotification = async (payload: PushPayload) => {
    await new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (forceFail) reject(new Error('Network error'));
        else resolve();
      }, 1200);
    });

    console.log('Отправка push-рассылки', payload);
  };

  return (
    <Box
      as='form'
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
          <FormSubmitButton
            rightIcon={<ArrowForwardIcon />}
            maxW="fit-content"
            ml="auto"
            isAuthorized={isAuthorized}
            onUnauthorized={onAuthClick}
            formIds={['pushNotification']}
            beforeSubmitValidate={validateExtraFields}
            onSubmit={() => {
              setForceFail(false);
              onOpen();
            }}
          >
            {isAuthorized ? 'Отправить' : 'Авторизоваться для отправки'}
          </FormSubmitButton>
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