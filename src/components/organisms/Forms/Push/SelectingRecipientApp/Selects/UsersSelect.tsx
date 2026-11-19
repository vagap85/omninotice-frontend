import { CloseIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Spinner, Text } from '@chakra-ui/react';

import { useSelectedUsers } from '../hooks/useSelectedUsers';
import { useSelectingRecipientApp } from '../hooks/useSelectingRecipientApp';
import SearchInput from '../Inputs/SearchInput';
import type { RecipientsMode, UsersSelectProps } from '../types/types';
import RecipientsModeSelect from './RecipientsModeSelect';
import { pluralize } from '@/components/molecules/helpers/pluralize';

export default function UsersSelect({ value, onChange }: UsersSelectProps) {
  const {
    selectedApp,
    isLoadingProjectUsers,
    projectUsers,
    projectUsersLoaded,
    projectUsersTotal,
    projectUsersError,
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
    setRecipientsError(null);
  };

  const handleAddUser = (user: Parameters<typeof addUser>[0]) => {
    addUser(user);
    setRecipientsError(null);
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

      {selectedApp && (
        <Text
          fontSize="xs"
          lineHeight="16px"
          color={projectUsersError ? '#EF4444' : '#52525B'}
          display="flex"
          alignItems="center"
          gap={1}
        >
          {isLoadingProjectUsers && (
            <Spinner
              size="xs"
              color="#346895"
            />
          )}
          {isLoadingProjectUsers
            ? `Загрузка пользователей: ${projectUsersLoaded} из ${projectUsersTotal ?? '...'}`
            : projectUsersError
              ? projectUsersError
              : `Загружено пользователей: ${projectUsers.length}`}
        </Text>
      )}

      {selectedValue === 'individual' && selectedApp && (
        <SearchInput
          key={selectedApp.project_id}
          onSelectUser={handleAddUser}
          error={recipientsError ? true : false}
        />
      )}

      {selectedUsers && selectedValue === 'individual' && (
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
          lineHeight="24px"
        >
          {selectedValue === 'all' && projectUsersLoaded
            ? `${pluralize(projectUsersLoaded, ["Выбран", "Выбрано", "Выбрано"])} ${projectUsersLoaded} ${pluralize(projectUsersLoaded, ["пользователь", "пользователя", "пользователей"])}`
            : selectedUsers
              ? `Добавлено получателей: ${selectedUsers.length}`
              : 'Ошибка получения данных'}
        </Text>
      )}
    </Flex>
  );
}
