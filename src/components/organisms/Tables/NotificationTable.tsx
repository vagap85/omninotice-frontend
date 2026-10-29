import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  Flex,
  Text,
  Link,
  Progress
} from '@chakra-ui/react';
import { Fragment } from 'react';

import { StatusBadge } from '@/components/atoms/Badge/StatusBadge';
import { NotificationLog } from '@/components/organisms/types/types';
import { formatDate, formatAppName } from '@/utils/formatters';

interface NotificationsTableProps {
  data: NotificationLog[];
  expandedId?: string | null;
  onRowClick?: (id: string) => void;
}

export const NotificationsTable = ({
  data,
  expandedId,
  onRowClick
}: NotificationsTableProps) => {
  const getMethodName = (method: string) => {
    if (method === 'manual') return 'Ручная';
    if (method === 'triggered') return 'Триггерная';
    return method;
  };

  return (
    <Box
      bg="white"
      borderRadius="16px"
      overflow="hidden"
    >
      <Table fontSize="md">
        <Thead>
          <Tr
            sx={{ th: { py: '22px' } }}
            fontWeight="semibold"
          >
            <Th>Приложение</Th>
            <Th>Шаблон</Th>
            <Th>Заголовок</Th>
            <Th textAlign="center">Отправлено</Th>
            <Th>Дата и время</Th>
            <Th textAlign="center">Статус</Th>
          </Tr>
        </Thead>
        <Tbody fontWeight="normal">
          {data.map((row) => {
            const isExpanded = expandedId === row.event_id;

            return (
              <Fragment key={row.event_id}>
                <Tr
                  onClick={() => onRowClick && onRowClick(row.event_id)}
                  cursor={onRowClick ? 'pointer' : 'default'}
                  _hover={{
                    bg: row.status === 'error' ? '#FEF2F2' : '#F8FAFC'
                  }}
                  transition="background 0.2s"
                  sx={{
                    td: {
                      borderBottom: isExpanded ? 'none' : '1px solid #E2E8F0'
                    }
                  }}
                >
                  <Td>
                    <Flex align="center">
                      <Text color="#12233F">
                        {formatAppName(row.application_id)}
                      </Text>
                    </Flex>
                  </Td>
                  <Td color="#2D547B">{row.template_name || 'Без шаблона'}</Td>
                  <Td>
                    <Tooltip
                      label={row.body}
                      bg="#12233F"
                      color="#ffffff"
                      placement="bottom-end"
                      hasArrow
                      p="8px"
                      borderRadius="4px"
                      maxW="230px"
                      whiteSpace="normal"
                    >
                      <Text
                        isTruncated
                        cursor="pointer"
                        color="#2D547B"
                      >
                        {row.title}
                      </Text>
                    </Tooltip>
                  </Td>
                  <Td
                    textAlign="center"
                    color="#12233F"
                  >
                    {row.recipients.length}
                  </Td>
                  <Td color="#12233F">{formatDate(row.created_at)}</Td>
                  <Td textAlign="center">
                    <Flex
                      w="100%"
                      justifyContent="center"
                    >
                      <StatusBadge status={row.status} />
                    </Flex>
                  </Td>
                </Tr>

                {isExpanded && (
                  <Tr>
                    <Td
                      colSpan={6}
                      p={0}
                      borderBottom="1px solid #E2E8F0"
                    >
                      <Box
                        bg="#F8FAFC"
                        p="24px"
                        borderTop="1px solid #E2E8F0"
                      >
                        <Flex
                          gap="60px"
                          mb="24px"
                        >
                          <Box flex="1">
                            <Text
                              fontSize="sm"
                              color="#64748B"
                              mb="4px"
                            >
                              Заголовок
                            </Text>
                            <Text
                              fontSize="md"
                              fontWeight="500"
                              color="#12233F"
                              mb="16px"
                            >
                              {row.title}
                            </Text>

                            <Text
                              fontSize="sm"
                              color="#64748B"
                              mb="4px"
                            >
                              Описание
                            </Text>
                            <Text
                              fontSize="md"
                              color="#12233F"
                              mb="16px"
                              lineHeight="tall"
                            >
                              {row.body}
                            </Text>

                            <Text
                              fontSize="sm"
                              color="#64748B"
                              mb="4px"
                            >
                              Ссылка действия
                            </Text>
                            <Link
                              color="#3B6EA0"
                              fontSize="md"
                              href="#"
                              isExternal
                            >
                              https://omni.skroy.ru/create/push?
                            </Link>
                          </Box>

                          <Box
                            flex="1.5"
                            display="grid"
                            gridTemplateColumns="repeat(3, 1fr)"
                            gap="24px"
                            alignContent="start"
                          >
                            <Box>
                              <Text
                                fontSize="sm"
                                color="#64748B"
                                mb="4px"
                              >
                                Дата и время
                              </Text>
                              <Text
                                fontSize="md"
                                color="#12233F"
                              >
                                {formatDate(row.created_at)}
                              </Text>
                            </Box>
                            <Box>
                              <Text
                                fontSize="sm"
                                color="#64748B"
                                mb="4px"
                              >
                                Способ отправки
                              </Text>
                              <Text
                                fontSize="md"
                                color="#12233F"
                              >
                                {getMethodName(row.send_method)}
                              </Text>
                            </Box>
                            <Box>
                              <Text
                                fontSize="sm"
                                color="#64748B"
                                mb="4px"
                              >
                                Получатели
                              </Text>
                              <Text
                                fontSize="md"
                                color="#12233F"
                              >
                                {formatAppName(row.application_id)} (
                                {row.recipients.length})
                              </Text>
                            </Box>
                            <Box gridColumn="span 3">
                              <Text
                                fontSize="sm"
                                color="#64748B"
                                mb="4px"
                              >
                                Инициатор отправления
                              </Text>
                              <Text
                                fontSize="md"
                                color="#12233F"
                              >
                                Иван Иванов
                              </Text>
                            </Box>
                          </Box>
                        </Flex>

                        {/* Блок статистики */}
                        <Flex
                          mt="24px"
                          gap="48px"
                          align="center"
                        >
                          <Box>
                            <Text
                              fontSize="sm"
                              color="#64748B"
                              mb="4px"
                            >
                              Отправлено
                            </Text>
                            <Text
                              fontSize="md"
                              color="#12233F"
                            >
                              {row.recipients.length} (100%)
                            </Text>
                          </Box>
                          <Box>
                            <Text
                              fontSize="sm"
                              color="#64748B"
                              mb="4px"
                            >
                              Ошибок
                            </Text>
                            <Text
                              fontSize="md"
                              color="#12233F"
                            >
                              0 (0%)
                            </Text>
                          </Box>
                          <Box
                            flex="1"
                            maxW="300px"
                          >
                            <Text
                              fontSize="sm"
                              color="#64748B"
                              mb="4px"
                            >
                              Прочитано получателями
                            </Text>
                            <Flex
                              align="center"
                              gap="12px"
                            >
                              <Text
                                fontSize="md"
                                color="#12233F"
                                minW="40px"
                              >
                                87%
                              </Text>
                              <Progress
                                value={87}
                                size="sm"
                                colorScheme="blue"
                                borderRadius="full"
                                flex="1"
                              />
                            </Flex>
                          </Box>
                        </Flex>
                      </Box>
                    </Td>
                  </Tr>
                )}
              </Fragment>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
};
