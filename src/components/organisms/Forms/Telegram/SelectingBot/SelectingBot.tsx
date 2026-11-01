import {
  Box,
  Button,
  Flex,
  Text,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import type { JSONContent } from '@tiptap/core';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  DispatchError,
  dispatchNotification,
  type NotificationDispatchInput
} from '@/api/vishenka';
import { useAuth } from '@/auth/AuthContext';
import ArrowRightIcon from '@/components/atoms/Icons/home/ArrowRightIcon';
import DropdownSelect from '@/components/molecules/DropdownSelect/DropdownSelect';
import { FormSubmitButton } from '@/components/molecules/Form/Elements/FormSubmitButton';
import RightSidebar from '@/components/molecules/RightSidebar/RightSidebar';
import SendController from '@/components/organisms/Modals/SendController/SendController';
import { telegramMessageJsonToHtml } from '@/components/molecules/helpers/telegramMessageFormat';
import RecipientsModeSelect from '../../Push/SelectingRecipientApp/Selects/RecipientsModeSelect';
import type { RecipientsMode } from '../../Push/SelectingRecipientApp/types/types';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { ROUTES } from '@/routing/routes';
import TelegramNotificationCard from '../Cards/NotificationCard';

const isTelegramMessage = (value: unknown): value is JSONContent =>
  Boolean(
    value &&
    typeof value === 'object' &&
    'type' in value &&
    value.type === 'doc'
  );

const BOTS = [
  {
    id: 'cloveri-start',
    label: 'Кловери.Старт',
    count: 235
  }
];

export default function SelectingBot() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { isAuthorized } = useAuth();
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [recipientsMode, setRecipientsMode] = useState<RecipientsMode>('all');
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [pendingNotification, setPendingNotification] =
    useState<NotificationDispatchInput | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSubmit = (values: Record<string, unknown>) => {
    const buttonText =
      typeof values.buttonText === 'string' ? values.buttonText.trim() : '';
    const buttonLink =
      typeof values.buttonLink === 'string' ? values.buttonLink.trim() : '';

    try {
      if (!selectedBot || !isTelegramMessage(values.message)) {
        throw new Error('Не удалось подготовить Telegram-рассылку к отправке.');
      }

      setPendingNotification({
        application_id: selectedBot,
        channels: ['tg'],
        title: typeof values.title === 'string' ? values.title : '',
        body: telegramMessageJsonToHtml(values.message),
        recipients: ['6627213813'], //! ЭТО ЧАТ В ТГ С ТЕСТОВЫМ БОТОМ ОТ @SokolykOff
        ...(buttonText && buttonLink
          ? {
              action: {
                name: buttonText,
                url: buttonLink
              }
            }
          : {})
      });
      onOpen();
    } catch (error) {
      showDispatchError(error);
    }
  };

  const showDispatchError = (error: unknown) => {
    const description =
      error instanceof DispatchError
        ? (JSON.stringify(error.detail) ?? error.message)
        : error instanceof Error
          ? error.message
          : 'Неизвестная ошибка отправки.';
    toast({
      status: 'error',
      title: 'Не удалось отправить Telegram-рассылку',
      description
    });
  };

  const sendNotification = async (
    payload: NotificationDispatchInput,
    signal: AbortSignal
  ) => {
    try {
      await dispatchNotification(payload, signal);
    } catch (error) {
      if (!signal.aborted) showDispatchError(error);
      throw error;
    }
  };

  const getPendingNotification = () => {
    if (!pendingNotification) {
      throw new Error('Не удалось подготовить Telegram-рассылку к отправке.');
    }
    return pendingNotification;
  };

  const validateTelegramSettings = () => {
    if (!selectedBot) {
      setSelectionError('Выберите бота-отправителя.');
      return false;
    }

    if (recipientsMode !== 'all') {
      setSelectionError('Сейчас можно отправлять только всем подписчикам.');
      return false;
    }

    setSelectionError(null);
    return true;
  };

  return (
    <RightSidebar title="Настройка рассылки">
      <Flex
        flexDirection={'column'}
        gap={3}
      >
        <DropdownSelect
          label="Бот-отправитель"
          placeholder="Выберите бота-отправителя"
          value={selectedBot}
          options={BOTS}
          onSelect={(option) => {
            setSelectedBot(option.id);
            setSelectionError(null);
          }}
          error={selectionError}
          helperText="Выберите бота, от имени которого будет отправлено сообщение"
        >
          <Box
            padding={2}
            w={'full'}
            maxW={'unset'}
          >
            <Button
              w={'full'}
              maxW={'unset'}
              type="button"
              onClick={() => navigate(ROUTES.connectTelegramBot)}
            >
              <Text flex={1}>Подключить нового бота</Text>
              <Box ml={'auto'}>
                <ArrowRightIcon />
              </Box>
            </Button>
          </Box>
        </DropdownSelect>
        <RecipientsModeSelect
          value={recipientsMode}
          onChange={(mode) => {
            setRecipientsMode(mode);
            setSelectionError(null);
          }}
          isDisabled={selectedBot == null}
        />
        <Flex
          flexDirection={'column'}
          gap={1.5}
        >
          <Text
            fontSize="lg"
            color="#12233F"
          >
            Как получатель увидит сообщение
          </Text>
          <TelegramNotificationCard />
        </Flex>
        <FormSubmitButton
          formIds={['telegramNotification']}
          beforeSubmitValidate={validateTelegramSettings}
          onSubmit={handleSubmit}
          isAuthorized={isAuthorized}
          onUnauthorized={() =>
            navigate(ROUTES.login, { state: { from: location } })
          }
          ml={'auto'}
          rightIcon={<ArrowForwardIcon />}
        >
          Отправить
        </FormSubmitButton>
      </Flex>
      <SendController
        variant="telegram"
        isOpen={isOpen}
        onClose={onClose}
        recipientsCount={pendingNotification?.recipients.length ?? 0}
        getPayload={getPendingNotification}
        onSend={sendNotification}
      />
    </RightSidebar>
  );
}
