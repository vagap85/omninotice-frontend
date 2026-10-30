import { CloseIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Text } from '@chakra-ui/react';

import { useSelectedUsers } from '../hooks/useSelectedUsers';
import { useSelectingRecipientApp } from '../hooks/useSelectingRecipientApp';
import SearchInput from '../Inputs/SearchInput';
import type { RecipientsMode, UsersSelectProps } from '../types/types';
import RecipientsModeSelect from './RecipientsModeSelect';

export default function UsersSelect({ value, onChange }: UsersSelectProps) {
  const {
    selectedApp,
    recipientsMode,
    setRecipientsMode,
    recipientsError,
    setRecipientsError
  } = useSelectingRecipientApp();
  const { selectedUsers, removeUser, addUser } = useSelectedUsers();

  const selectedValue = value !== undefined ? value : recipientsMode;

  const handleChange = (next: RecipientsMode) => {
    if (value === undefined) setRecipientsMode(next);
    onChange?.(next);
    setRecipientsError(null); // при смене режима прошлая ошибка уже не актуальна
  };

  const handleAddUser = (user: Parameters<typeof addUser>[0]) => {
    addUser(user);
    setRecipientsError(null); // как только выбрали хотя бы одного — ошибка снимается сама
  };

  return (
    <Flex
      direction={'column'}
      gap={1.5}
    >
      <Text
        fontSize="lg"
        color="#12233F"
      >
        Получатели
      </Text>

      <RecipientsModeSelect
        value={selectedValue}
        onChange={handleChange}
        isDisabled={selectedApp == null}
      />

      {selectedValue == 'individual' && selectedApp && (
        <SearchInput
          platform={selectedApp.platform}
          onSelectUser={handleAddUser}
          error={recipientsError ? true : false}
        />
      )}

      {selectedUsers && selectedValue == 'individual' && (
        <Flex
          flexWrap={'wrap'}
          gap={1}
        >
          {selectedUsers.map(({ id, full_name }) => (
            <Flex
              key={id}
              padding={2}
              gap={2}
              borderRadius={8}
              bg={'#F8FAFC'}
              outline={'0.5px solid #E2EBF3'}
              alignItems={'center'}
              transition={'outline 0.2s ease-in, background-color 0.2s ease-in'}
              _hover={{ bg: '#E2EBF3', outline: 'none' }}
            >
              <Text
                color={'#12233F'}
                lineHeight={5}
                fontSize={'sm'}
              >
                {full_name}
              </Text>
              <IconButton
                w={6}
                h={6}
                aria-label="Удалить пользователя"
                icon={
                  <CloseIcon
                    width={2.5}
                    height={2.5}
                  />
                }
                size="xs"
                variant="ghost"
                color="#A1A1AA"
                _hover={{ color: '#EF4444', bg: 'transparent' }}
                onClick={() => removeUser(id)}
              />
            </Flex>
          ))}
        </Flex>
      )}

      {recipientsError && (
        <Text
          fontSize="xs"
          color="#EF4444"
          mt={-0.5}
        >
          {recipientsError}
        </Text>
      )}

      {selectedApp && (
        <Text
          fontSize="md"
          color="#008F6D"
          fontWeight="medium"
          lineHeight={'24px'}
        >
          Добавлено получателей:{' '}
          {selectedValue == 'all'
            ? selectedApp?.count
            : (selectedUsers.length ?? 'Ошибка получения данных')}
        </Text>
      )}
    </Flex>
  );
}
