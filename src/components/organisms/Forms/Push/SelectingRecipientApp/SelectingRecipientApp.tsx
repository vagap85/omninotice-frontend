import { ArrowForwardIcon } from '@chakra-ui/icons/ArrowForward';
import { Box, Flex, Heading, useDisclosure } from '@chakra-ui/react';
import { memo } from 'react';
import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createDispatch,
  DispatchError,
  generateRequestId
} from '@/api/vishenka';
import { FormSubmitButton } from '@/components/molecules/Form/Elements/FormSubmitButton';
import { useFormsRegistry } from '@/components/molecules/Form/hooks/useFormsRegistry';
import { useFormValues } from '@/components/molecules/Form/hooks/useFormValues';
import SendController from '@/components/organisms/Modals/SendController/SendController';
import type {
  PushPayload,
  PushNotificationFormValues
} from '@/components/organisms/types/types';
import { sanitizeSubmitValue } from '@/utils/sanitizeSubmitValue';

import AllSelectBoxes from './AllSelectBoxes';
import { useSelectedUsers } from './hooks/useSelectedUsers';
import { useSelectingRecipientApp } from './hooks/useSelectingRecipientApp';
import { SelectedUsersProvider } from './Providers/SelectedUsers.provider';
import SelectingRecipientAppProviderTest from './Providers/SelectingRecipientApp.provider';
import BellRingIcon from '@/components/atoms/Icons/collections/Sigma/BellRingIcon';
import { useNotification } from 'omni-notice-sigma-notification-widget';

interface PanelContentProps {
  isAuthorized: boolean;
}

// Функция для замены {{var}} на значения
const interpolateText = (text: string, vars: Record<string, string>) => {
  if (!text) return '';
  let result = text;
  Object.entries(vars).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value || `{{${key}}}`);
  });
  return result;
};

function SelectingRecipientApp({ isAuthorized }: PanelContentProps) {
  return (
    <SelectingRecipientAppProviderTest>
      <SelectedUsersProvider>
        <PanelContentInner
          isAuthorized={isAuthorized}
        />
      </SelectedUsersProvider>
    </SelectingRecipientAppProviderTest>
  );
}

function PanelContentInner({ isAuthorized }: PanelContentProps) {
  const navigate = useNavigate();
  const registry = useFormsRegistry();
  const { selectedApp, recipientsMode, setAppError, setRecipientsError } =
    useSelectingRecipientApp();
  const { selectedUsers } = useSelectedUsers();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {add} = useNotification()

  const onAuthClick = () => navigate('/login');

  const recipientsCount =
    recipientsMode === 'all' ? (selectedApp?.count ?? 0) : selectedUsers.length;

  const formValues = useFormValues<
    PushNotificationFormValues & { _isContentValid: boolean }
  >('pushNotification');
  const isContentValid = formValues._isContentValid === true;

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

    // Добавляем проверку контента
    if (!isContentValid) {
      appValid = false;
    }

    return appValid && recipientsValid;
  };

  const buildPayload = (): PushPayload => {
    const contentStore = registry.getStore('pushNotification');
    const contentValues = contentStore!.getValues<
      PushNotificationFormValues & { variableValues?: Record<string, string> }
    >();

    // Интерполируем текст перед отправкой
    const finalText = interpolateText(
      contentValues.text || '',
      contentValues.variableValues || {}
    );

    return {
      title: sanitizeSubmitValue(contentValues.title),
      text: sanitizeSubmitValue(finalText),
      buttonText: sanitizeSubmitValue(contentValues.buttonText),
      buttonLink: contentValues.buttonLink,
      app: selectedApp,
      recipientsMode,
      selectedUsers: recipientsMode === 'individual' ? selectedUsers : undefined
    };
  };

  const sendPushNotification = async (payload: PushPayload) => {
    try {
      const app = payload.app as {
        id: string;
        platform?: string;
        icon?: {
          Icon: ComponentType;
        };
      };
      console.log(app);

      if (app?.platform === 'OmniNoticeTest') {
        const IconComponent = app.icon?.Icon;

        add({
          status: 'info',
          title: payload.title,
          description: payload.text,
          picture: {
            icon: IconComponent ? IconComponent : <BellRingIcon />
          },
          action: {
            title: payload.buttonText,
            url: payload.buttonLink
          }
        });

        localStorage.setItem('onboarding_real_send', 'true');
      } else {
        const response = await createDispatch({
          request_id: generateRequestId(),
          application_id: app?.id ?? 'sigma',
          channel: 'popup',
          title: payload.title,
          body: payload.text,
          audience_type: payload.recipientsMode === 'all' ? 'all' : 'selected',
          recipient_ids:
            payload.recipientsMode === 'individual'
              ? (payload.selectedUsers?.map((u) => u.id) ?? [])
              : []
        });
        console.log('Push отправлен:', response.detail.code);
        localStorage.setItem('onboarding_real_send', 'true');
      }
    } catch (error) {
      if (error instanceof DispatchError) {
        console.error('Dispatch error:', error.status, error.detail);
      }
      throw error;
    }
  };

  return (
    <Box
      as="form"
      maxW={{ base: 'unset', md: '360px', xxl: '29.17vw' }}
      p={{ base: 'clamp(12px, 1.7vw + 0.125rem, 24px)', md: 'unset' }}
      borderLeft="1px solid"
      borderColor="gray.200"
      minH={{ base: 'unset', md: 'calc(100vh - 73px)' }}
      w={'full'}
    >
      <Flex
        w="100%"
        h={'100%'}
        px={6}
        py={5}
        bg="white"
        flexDirection={'column'}
        borderRadius={{ base: '10px', md: 'none' }}
      >
        <Heading
          size="md"
          mb={6}
        >
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
            onSubmit={() => onOpen()}
            isDisabled={!isContentValid}
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
