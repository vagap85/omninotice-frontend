import {
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
  Spinner
} from '@chakra-ui/react';
import { useRef, useState, useMemo } from 'react';

import type { User } from '@/api/types'; // Импортируем тип для избавления от any
import type { ProjectUser } from '@/api/vishenka';
import CloseIcon from '@/components/atoms/Icons/CloseIcon';
import SearchIcon from '@/components/atoms/Icons/SearchIcon';

import { useSelectedUsers } from '../hooks/useSelectedUsers';
import { useSelectingRecipientApp } from '../hooks/useSelectingRecipientApp';
import type { SearchInputProps } from '../types/types';

const MIN_QUERY_LENGTH = 3;

export default function SearchInput({ onSelectUser, error }: SearchInputProps) {
  const { selectedUsers, addUser } = useSelectedUsers();
  const {
    projectUsers: allUsers,
    isLoadingProjectUsers: isLoading,
    projectUsersError
  } = useSelectingRecipientApp();
  const [value, setValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const queryTooShort = value.trim().length < MIN_QUERY_LENGTH;

  const handleClear = () => {
    const input = inputRef.current;
    if (!input) return;

    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;
    nativeSetter?.call(input, '');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
    setValue('');
  };

  const handleChange = () => {
    const input = inputRef.current;
    if (!input) return;
    setValue(input.value);
  };

  const handleSelectUser = (user: ProjectUser) => {
    // Используем unknown as User вместо any
    const userAsUser = user as unknown as User;
    addUser(userAsUser);
    onSelectUser?.(userAsUser);
    handleClear();
  };

  // Локальная фильтрация пользователей
  const visibleResults = useMemo(() => {
    if (queryTooShort) return [];

    const query = value.toLowerCase().trim();

    return allUsers.filter((user) => {
      // Исключаем уже выбранных
      if (selectedUsers.some((selected) => selected.id === user.id)) {
        return false;
      }
      // Ищем по логину (full_name) или ID
      return (
        user.full_name.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query)
      );
    });
  }, [allUsers, value, queryTooShort, selectedUsers]);

  const showResults = !isLoading && !queryTooShort && visibleResults.length > 0;

  let statusText = 'Начните вводить логин или ID';
  if (isLoading) {
    statusText = 'Загрузка базы пользователей...';
  } else if (projectUsersError) {
    statusText = projectUsersError;
  } else if (!queryTooShort && visibleResults.length === 0) {
    statusText = 'Никого не нашли';
  }

  return (
    <Flex
      direction={'column'}
      gap={1.5}
    >
      <InputGroup
        color="#A1A1AA"
        _focusWithin={{ color: '#3B6EA0' }}
      >
        <InputLeftElement
          color={error ? 'red.500' : 'inherit'}
          pointerEvents="none"
          top={'50%'}
          transform={'translateY(-50%)'}
          _focusVisible={{ color: error ? 'red.500' : 'inherit' }}
          _hover={{ color: error ? 'red.500' : 'inherit' }}
        >
          <SearchIcon
            width={16}
            height={16}
          />
        </InputLeftElement>

        <Input
          ref={inputRef}
          id="search"
          type="search"
          placeholder="Введите логин или ID"
          aria-label="Поиск по логину или ID"
          border="none"
          pr={8}
          outlineColor={error ? 'red.500' : 'none'}
          _focus={{ border: 'none' }}
          _focusVisible={{ outlineColor: error ? 'red.500' : '#3182ce' }}
          _hover={{ outlineColor: error ? 'red.500' : '#3182ce' }}
          sx={{
            '&::-webkit-search-cancel-button': {
              WebkitAppearance: 'none',
              appearance: 'none',
              margin: 0
            }
          }}
          borderRadius={'10px'}
          h={'44px'}
          color={'#12233F'}
          value={value}
          onChange={handleChange}
          disabled={isLoading} // Блокируем ввод, пока грузится база
        />

        <InputRightElement
          opacity={0}
          pointerEvents="none"
          transition="opacity 0.15s ease"
          sx={{
            'input:not(:placeholder-shown) ~ &': {
              opacity: 1,
              pointerEvents: 'auto'
            }
          }}
          maxW={6}
          maxH={6}
        >
          <IconButton
            aria-label="Очистить поле"
            icon={
              <CloseIcon
                width={9}
                height={9}
                color="#12233F"
              />
            }
            size="xs"
            variant="ghost"
            color="inherit"
            onClick={handleClear}
            maxH={'24px'}
            maxW={'24px'}
            top={'10px'}
            right={'18px'}
            minH={'unset'}
            borderRadius={'4px'}
          />
        </InputRightElement>
      </InputGroup>

      {showResults && (
        <Flex
          direction="column"
          gap={1}
          padding={1}
          bg={'white'}
          outline={'1px solid #E2EBF3'}
          borderRadius={8}
          boxShadow="0 4px 12px rgba(0,0,0,0.08)"
          overflowY="auto"
          maxH="200px"
        >
          {visibleResults.map((user) => (
            <Flex
              key={user.id}
              p={2}
              borderRadius={10}
              _hover={{ bg: '#F8FAFC', cursor: 'pointer' }}
              onClick={() => handleSelectUser(user)}
              direction="column"
            >
              <Text
                fontSize="md"
                fontWeight={'medium'}
                lineHeight={'24px'}
                color="#12233F"
              >
                {user.full_name}
              </Text>
              <Text
                fontSize="xs"
                color="#94A3B8"
              >
                ID: {user.id}
              </Text>
            </Flex>
          ))}
        </Flex>
      )}

      {!showResults && (
        <Text
          fontSize="xs"
          lineHeight="16px"
          color={projectUsersError ? '#EF4444' : '#52525B'}
          minH="16px"
          display="flex"
          alignItems="center"
          gap={1}
        >
          {isLoading && (
            <Spinner
              size="xs"
              color="#346895"
            />
          )}
          {statusText}
        </Text>
      )}
    </Flex>
  );
}
