import { Box, Button, Flex, Text, useToast } from '@chakra-ui/react';
import { useState } from 'react';

import ArrowRightIcon from '@/components/atoms/Icons/home/ArrowRightIcon';
import DropdownSelect from '@/components/molecules/DropdownSelect/DropdownSelect';
import { FormSubmitButton } from '@/components/molecules/Form/Elements/FormSubmitButton';
import RightSidebar from '@/components/molecules/RightSidebar/RightSidebar';
import RecipientsModeSelect from '../../Push/SelectingRecipientApp/Selects/RecipientsModeSelect';
import type { RecipientsMode } from '../../Push/SelectingRecipientApp/types/types';

const BOTS = [
  {
    id: 'cloveri-start',
    label: 'Кловери.Старт',
    count: 235
  }
];

export default function SelectingBot() {
  const toast = useToast();
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [recipientsMode, setRecipientsMode] = useState<RecipientsMode>('all');
  const [selectionError, setSelectionError] = useState<string | null>(null);

  const handleSubmit = () => {
    toast({
      status: 'warning',
      title: 'Отправка Telegram пока недоступна',
      description:
        'Для отправки необходимо подключить API и сохранить delegated token при авторизации.'
    });
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
        <FormSubmitButton
          formIds={['telegramNotification']}
          beforeSubmitValidate={validateTelegramSettings}
          onSubmit={handleSubmit}
          ml={'auto'}
        >
          Отправить
        </FormSubmitButton>
      </Flex>
    </RightSidebar>
  );
}
