import { ArrowForwardIcon } from '@chakra-ui/icons/ArrowForward';
import { Flex, useDisclosure } from '@chakra-ui/react';
import { memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  dispatchNotification,
  DispatchError,
} from '@/api/vishenka';
import { FormSubmitButton } from '@/components/molecules/Form/Elements/FormSubmitButton';
import { useFormsRegistry } from '@/components/molecules/Form/hooks/useFormsRegistry';
import { useFormValues } from '@/components/molecules/Form/hooks/useFormValues';
import RightSidebar from '@/components/molecules/RightSidebar/RightSidebar';
import SendController from '@/components/organisms/Modals/SendController/SendController';
import type {
  PushPayload,
  PushNotificationFormValues
} from '@/components/organisms/types/types';
import { sanitizeSubmitValue } from '@/utils/sanitizeSubmitValue';
import { countMeaningfulLength } from '@/utils/meaningfulLength';
import type { SelectedApp } from './types/types';
import { getCollectionIconUrl } from './utils/collectionIconUrl';

import AllSelectBoxes from './AllSelectBoxes';
import { useSelectedUsers } from './hooks/useSelectedUsers';
import { useSelectingRecipientApp } from './hooks/useSelectingRecipientApp';
import { SelectedUsersProvider } from './Providers/SelectedUsers.provider';
import SelectingRecipientAppProviderTest from './Providers/SelectingRecipientApp.provider';
import { useNotification } from 'omni-notice-sigma-notification-widget';
import { ROUTES } from '@/routing/routes';
import { ConnectedApp } from '@/api/types';

interface PanelContentProps {
  isAuthorized: boolean;
  connectedApps: ConnectedApp[];
}

const interpolateText = (text: string, vars: Record<string, string>) => {
  if (!text) return '';
  let result = text;
  Object.entries(vars).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value || `{{${key}}}`);
  });
  return result;
};

function SelectingRecipientApp({
  isAuthorized,
  connectedApps
}: PanelContentProps) {
  return (
    <SelectingRecipientAppProviderTest connectedApps={connectedApps}>
      <SelectedUsersProvider>
        <PanelContentInner isAuthorized={isAuthorized} />
      </SelectedUsersProvider>
    </SelectingRecipientAppProviderTest>
  );
}

function PanelContentInner({ isAuthorized }: { isAuthorized: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const registry = useFormsRegistry();
  const {
    selectedApp,
    selectedIcon,
    recipientsMode,
    setAppError,
    setRecipientsError,
    projectUsersLoaded
  } = useSelectingRecipientApp();
  const { selectedUsers } = useSelectedUsers();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { add } = useNotification();

  const onAuthClick = () =>
    navigate(ROUTES.login, { state: { from: location } });

  const recipientsCount =
    recipientsMode === 'all' ? projectUsersLoaded : selectedUsers.length;

  const formValues = useFormValues<
    PushNotificationFormValues & {
      variableValues?: Record<string, string>;
    }
  >('pushNotification');

  const contentText = formValues.text || '';
  const variables = contentText.match(/\{\{([^}]+)\}\}/g) || [];

  const allVariablesFilled = variables.every((variable) =>
    formValues.variableValues?.[variable.slice(2, -2)]?.trim()
  );

  const resolvedContentText = contentText.replace(
    /\{\{([^}]+)\}\}/g,
    (_, variable: string) => formValues.variableValues?.[variable] ?? ''
  );

  const isContentWithinLimits =
    countMeaningfulLength(formValues.title || '') <= 50 &&
    countMeaningfulLength(resolvedContentText) <= 200;

  const isContentValid = Boolean(
    formValues.title?.trim() &&
    contentText.trim() &&
    allVariablesFilled &&
    isContentWithinLimits
  );

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
      selectedIcon,
      recipientsMode,
      selectedUsers: recipientsMode === 'individual' ? selectedUsers : undefined
    };
  };

  const sendPushNotification = async (
    payload: PushPayload,
    signal: AbortSignal
  ) => {
    try {
      const app = payload.app as SelectedApp | null;

      if (!app) {
        throw new Error('Приложение не выбрано');
      }

      // Проверка на тестовое приложение (заменили platform на title)
      if (app.title === 'OmniNoticeTest') {
        add({
          status: 'info',
          title: payload.title,
          description: payload.text,
          picture: {
            icon: (
              <span
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 38,
                  height: 38,
                  borderRadius: 6,
                  backgroundColor: app.color ?? '#3B6EA0'
                }}
              />
            )
          },
          action: {
            title: payload.buttonText,
            url: payload.buttonLink
          }
        });

        localStorage.setItem('onboarding_real_send', 'true');
      } else {
        const response = await dispatchNotification(
          {
            application_id: app.project_id, // Заменили app.id на app.project_id
            channels: ['in_app'],
            title: payload.title,
            body: payload.text,
            picture: {
              icon: getCollectionIconUrl(payload.selectedIcon)
            },
            recipients:
              payload.recipientsMode === 'individual'
                ? (payload.selectedUsers?.map((u) => u.id) ?? [])
                : [],
            ...(payload.buttonText.trim() && payload.buttonLink.trim()
              ? {
                  action: {
                    title: payload.buttonText,
                    url: payload.buttonLink,
                    type: 'button' as const
                  }
                }
              : {})
          },
          signal
        );
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
    <RightSidebar title="Настройка рассылки">
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

      <SendController
        variant="push"
        isOpen={isOpen}
        onClose={onClose}
        recipientsCount={recipientsCount}
        getPayload={buildPayload}
        onSend={sendPushNotification}
      />
    </RightSidebar>
  );
}

export default memo(SelectingRecipientApp);
