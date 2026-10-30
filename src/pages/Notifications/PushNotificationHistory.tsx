import { SearchIcon, EmailIcon } from '@chakra-ui/icons';
import {
  Box,
  Flex,
  Text,
  InputGroup,
  InputLeftElement,
  HStack
} from '@chakra-ui/react';
import { useState } from 'react';
import { FiInbox } from 'react-icons/fi';

import CustomButton from '@/components/atoms/Button/CustomButton';
import CustomInput from '@/components/atoms/Input/CustomInput';
import { FilterMenu } from '@/components/molecules/FilterMenu/FilterMenu';
import { Pagination } from '@/components/organisms/Pagination/Pagination';
import { NotificationsTable } from '@/components/organisms/Tables/NotificationTable';
import { MOCK_DATA } from '@/mocks/notificationMocks';

const ITEMS_PER_PAGE = 6;

export default function NotificationHistoryPage() {
  const [currentPage, setCurrentPage] = useState(1);

  // Состояние для имитации ошибки загрузки данных
  const [isError, setIsError] = useState(false);

  // Состояние для раскрытой строки
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Состояния для фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState('Все приложения');
  const [selectedStatus, setSelectedStatus] = useState('Все статусы');
  const [selectedMethod, setSelectedMethod] = useState('Способ отправки');
  const [selectedPeriod, setSelectedPeriod] = useState('Период');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
    setExpandedId(null);
  };

  const handleFilterChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (value: string) => {
      setter(value);
      setCurrentPage(1);
      setExpandedId(null);
    };

  // Логика клика по строке
  const handleRowClick = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleRetry = () => {
    setIsError(false);
  };

  const filteredData = MOCK_DATA.filter((item) => {
    if (
      searchQuery &&
      !item.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    if (selectedApp !== 'Все приложения') {
      const appId = selectedApp === 'Сигма' ? 'sigma' : 'raida';
      if (item.application_id !== appId) return false;
    }

    if (selectedStatus !== 'Все статусы') {
      const statusId = selectedStatus === 'Отправлено' ? 'sent' : 'error';
      if (item.status !== statusId) return false;
    }

    if (selectedMethod !== 'Способ отправки' && selectedMethod !== 'Все') {
      const methodId = selectedMethod === 'Ручная' ? 'manual' : 'triggered';
      if (item.send_method !== methodId) return false;
    }

    if (selectedPeriod !== 'Период' && selectedPeriod !== 'За все время') {
      const now = new Date().getTime();
      const itemDate = new Date(item.created_at).getTime();
      const diffDays = (now - itemDate) / (1000 * 3600 * 24);

      if (selectedPeriod === 'За 7 дней' && diffDays > 7) return false;
      if (selectedPeriod === 'За 30 дней' && diffDays > 30) return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  let displayData = currentData;
  if (expandedId) {
    const expandedIndex = filteredData.findIndex(
      (item) => item.event_id === expandedId
    );
    if (expandedIndex !== -1) {
      displayData = [filteredData[expandedIndex]];
      if (expandedIndex + 1 < filteredData.length) {
        displayData.push(filteredData[expandedIndex + 1]);
      }
    }
  }

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedApp('Все приложения');
    setSelectedStatus('Все статусы');
    setSelectedMethod('Способ отправки');
    setSelectedPeriod('Период');
    setCurrentPage(1);
    setExpandedId(null);
  };

  return (
    <Box
      minH="100vh"
      bg="#ECF2F8"
      p="32px 40px 64px"
    >
      <Flex
        justify="space-between"
        align="center"
        mb="32px"
      >
        <Text
          fontSize="3xl"
          fontWeight="600"
          color="#12233F"
          lineHeight="38px"
        >
          История рассылок push-уведомлений
        </Text>

        <CustomButton
          bg="#3B6EA0"
          color="white"
          borderRadius="xl"
          fontSize="md"
          fontWeight="500"
          lineHeight="24px"
          p="12px 20px"
          display="flex"
          alignItems="center"
          rightIcon={<Text fontSize="20px">+</Text>}
        >
          Сохранить ссылку
        </CustomButton>
      </Flex>

      <Flex
        justify="space-between"
        align="center"
        mb="32px"
      >
        <InputGroup
          maxW="600px"
          bg="white"
          borderRadius="10px"
          mr="10px"
        >
          <InputLeftElement
            pointerEvents="none"
            h="100%"
            pl="12px"
          >
            <SearchIcon color="#A1A1AA" />
          </InputLeftElement>

          <CustomInput
            placeholder="Поиск по названию рассылки"
            bg="white"
            color="#12233F"
            borderColor="#F8FAFC"
            value={searchQuery}
            onChange={handleSearchChange}
            pl="40px"
          />
        </InputGroup>

        <HStack>
          <FilterMenu
            label="Все приложения"
            options={['Все приложения', 'Сигма', 'Raida']}
            value={selectedApp}
            onSelect={handleFilterChange(setSelectedApp)}
          />
          <FilterMenu
            label="Все статусы"
            options={['Все статусы', 'Отправлено', 'Ошибка']}
            value={selectedStatus}
            onSelect={handleFilterChange(setSelectedStatus)}
          />
          <FilterMenu
            label="Способ отправки"
            options={['Все', 'Триггерная', 'Ручная']}
            value={selectedMethod}
            onSelect={handleFilterChange(setSelectedMethod)}
          />
          <FilterMenu
            label="Период"
            options={['За все время', 'За 7 дней', 'За 30 дней']}
            value={selectedPeriod}
            onSelect={handleFilterChange(setSelectedPeriod)}
          />
          <CustomButton
            bg="transparent"
            color="#12233F"
            fontWeight="medium"
            fontSize="sm"
            onClick={handleResetFilters}
          >
            Сбросить фильтры
          </CustomButton>
        </HStack>
      </Flex>

      {isError ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          bg="#FFFFFF"
          p="40px 32px"
          borderRadius="20px"
        >
          <Box
            bg="#FEF2F2"
            p="16px"
            borderRadius="16px"
            mb="20px"
          >
            <EmailIcon
              color="#EF4444"
              boxSize="24px"
            />
          </Box>
          <Text
            fontSize="xl"
            fontWeight="bold"
            color="#12233F"
            mb="4px"
          >
            Не удалось загрузить историю
          </Text>
          <Text
            fontSize="md"
            color="#52525B"
            mb="12px"
          >
            Проверьте соединение и повторите. Ничего не потеряется.
          </Text>
          <CustomButton
            bg="#3B6EA0"
            color="white"
            borderRadius="xl"
            fontSize="md"
            fontWeight="500"
            p="12px 20px"
            onClick={handleRetry}
          >
            Повторить
          </CustomButton>
        </Flex>
      ) : filteredData.length > 0 ? (
        <>
          <NotificationsTable
            data={displayData}
            expandedId={expandedId}
            onRowClick={handleRowClick}
          />
          {!expandedId && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      ) : (
        <Flex
          direction="column"
          align="center"
          justify="center"
          bg="#fff"
          p="40px 32px"
          borderRadius="20px"
        >
          <Box
            bg="#ECF2F8"
            p="12px 14px"
            borderRadius="10px"
            mb="24px"
          >
            <FiInbox
              color="#12233F"
              size="24px"
            />
          </Box>
          <Text
            fontSize="xl"
            fontWeight="bold"
            color="#12233F"
            mb="4px"
          >
            Рассылки не найдены
          </Text>
          <Text
            fontSize="md"
            color="#64748B"
            mb="12px"
          >
            Измените фильтры или отправьте первую рассылку
          </Text>
          <CustomButton
            bg="#3B6EA0"
            color="white"
            borderRadius="xl"
            fontSize="md"
            fontWeight="500"
            p="12px 16px"
            rightIcon={
              <Text
                fontSize="20px"
                fontWeight="300"
              >
                +
              </Text>
            }
          >
            Создать рассылку
          </CustomButton>
        </Flex>
      )}
    </Box>
  );
}
