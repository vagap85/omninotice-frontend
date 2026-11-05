import { SearchIcon, EmailIcon } from '@chakra-ui/icons';
import {
  Box,
  Flex,
  Text,
  InputGroup,
  InputLeftElement,
  HStack,
  Button,
  Spinner,
  Center
} from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { FiInbox } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

import { getDispatchLogs, DispatchLog } from '@/api/vishenka';
import CustomButton from '@/components/atoms/Button/CustomButton';
import CustomInput from '@/components/atoms/Input/CustomInput';
import { FilterMenu } from '@/components/molecules/FilterMenu/FilterMenu';
import { Pagination } from '@/components/organisms/Pagination/Pagination';
import { NotificationsTable } from '@/components/organisms/Tables/NotificationTable';

const ITEMS_PER_PAGE = 6;

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] }
};

const fadeScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
};

export default function NotificationHistoryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Состояния данных (используем DispatchLog вместо NotificationLog)
  const [logs, setLogs] = useState<DispatchLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState('Все приложения');
  const [selectedStatus, setSelectedStatus] = useState('Все статусы');
  const [selectedMethod, setSelectedMethod] = useState('Способ отправки');
  const [selectedPeriod, setSelectedPeriod] = useState('Период');

  // Функция загрузки данных
  const loadLogs = useCallback(async (page: number) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await getDispatchLogs(page, ITEMS_PER_PAGE);
      setLogs(response.data);

      // Если API возвращает общее количество, используем его.
      if (response.info?.total) {
        setTotalPages(Math.ceil(response.info.total / ITEMS_PER_PAGE));
      } else {
        setTotalPages(
          response.data.length === ITEMS_PER_PAGE ? page + 1 : page
        );
      }
    } catch (error) {
      console.error('Ошибка при загрузке логов:', error);
      setIsError(true);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Загружаем при монтировании и смене страницы
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLogs(currentPage);
  }, [currentPage, loadLogs]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setExpandedId(null);
  };

  const handleFilterChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (value: string) => {
      setter(value);
      setExpandedId(null);
    };

  const handleRowClick = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleRetry = () => loadLogs(currentPage);

  // Фильтрация (применяется к загруженной странице)
  const filteredData = logs.filter((item) => {
    if (
      searchQuery &&
      !item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
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

  // Логика раскрытия строки
  let displayData = filteredData;
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
    setExpandedId(null);
  };

  const tableKey = `table-page-${currentPage}-${isLoading}`;

  return (
    <Box
      minH="100vh"
      bg="#ECF2F8"
      p="32px 40px 64px"
    >
      {/* Заголовок и кнопка */}
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
          Сократить ссылку
        </CustomButton>
      </Flex>

      {/* Фильтры */}
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

        <HStack
          spacing="8px"
          align="center"
          flexWrap="nowrap"
        >
          <Box
            w="160px"
            flexShrink={0}
          >
            <FilterMenu
              label="Все приложения"
              options={['Все приложения', 'Сигма', 'Raida']}
              value={selectedApp}
              onSelect={handleFilterChange(setSelectedApp)}
            />
          </Box>
          <Box
            w="150px"
            flexShrink={0}
          >
            <FilterMenu
              label="Все статусы"
              options={['Все статусы', 'Отправлено', 'Ошибка']}
              value={selectedStatus}
              onSelect={handleFilterChange(setSelectedStatus)}
            />
          </Box>
          <Box
            w="170px"
            flexShrink={0}
          >
            <FilterMenu
              label="Способ отправки"
              options={['Все', 'Триггерная', 'Ручная']}
              value={selectedMethod}
              onSelect={handleFilterChange(setSelectedMethod)}
            />
          </Box>
          <Box
            w="150px"
            flexShrink={0}
          >
            <FilterMenu
              label="Период"
              options={['За все время', 'За 7 дней', 'За 30 дней']}
              value={selectedPeriod}
              onSelect={handleFilterChange(setSelectedPeriod)}
            />
          </Box>
          <Button
            flexShrink={0}
            whiteSpace="nowrap"
            variant="ghost"
            bg="transparent"
            color="#12233F"
            fontWeight="medium"
            fontSize="sm"
            px="12px"
            py="10px"
            h="44px"
            borderRadius="10px"
            border="1px solid transparent"
            _hover={{ color: '#2D547B' }}
            _active={{ bg: '#D4E1EE' }}
            _focusVisible={{ outline: 'none', borderColor: '#3B6EA0' }}
            onClick={handleResetFilters}
          >
            Сбросить фильтры
          </Button>
        </HStack>
      </Flex>

      {/* Состояния и Таблица */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading-state"
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            exit={fadeInUp.exit}
            transition={fadeInUp.transition}
          >
            <Center
              py={20}
              bg="#FFFFFF"
              borderRadius="20px"
            >
              <Spinner
                color="#346895"
                size="xl"
                thickness="3px"
              />
            </Center>
          </motion.div>
        ) : isError ? (
          <motion.div
            key="error-state"
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            exit={fadeInUp.exit}
            transition={fadeInUp.transition}
          >
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
          </motion.div>
        ) : displayData.length > 0 ? (
          <motion.div
            key={tableKey}
            initial={fadeScale.initial}
            animate={fadeScale.animate}
            exit={fadeScale.exit}
            transition={fadeScale.transition}
          >
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
          </motion.div>
        ) : (
          <motion.div
            key="empty-state"
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            exit={fadeInUp.exit}
            transition={fadeInUp.transition}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
