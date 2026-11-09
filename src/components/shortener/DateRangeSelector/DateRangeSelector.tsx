import { useState, useEffect } from 'react';
import {
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Box,
  InputGroup,
  Input,
  InputRightElement,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import DatePicker from '../DatePicker/DatePicker';

const periodOptions = [
  { value: '7days', label: 'Последние 7 дней' },
  { value: 'today', label: 'Сегодня' },
  { value: 'yesterday', label: 'Вчера' },
  { value: 'thisMonth', label: 'Текущий месяц' },
  { value: '30days', label: 'Последние 30 дней' },
  { value: 'allTime', label: 'За весь период' },
  { value: 'custom', label: 'Произвольный период' },
];

const periodDays: Record<string, number> = {
  '7days': 7,
  today: 1,
  yesterday: 1,
  thisMonth: 30,
  '30days': 30,
  allTime: 90,
};

/** Разница в днях между датами формата DD.MM.YYYY */
const diffDays = (start: string, end: string): number => {
  const parse = (value: string) => {
    const [d, m, y] = value.split('.').map(Number);
    return Date.UTC(y, (m || 1) - 1, d || 1);
  };
  const diff = Math.round((parse(end) - parse(start)) / (24 * 60 * 60 * 1000));
  return Math.min(Math.max(diff + 1, 1), 365);
};

interface DateRangeSelectorProps {
  /** Вызывается при смене периода: количество дней для запроса статистики */
  onChange?: (days: number) => void;
}

export default function DateRangeSelector({
  onChange,
}: DateRangeSelectorProps) {
  const [period, setPeriod] = useState('7days');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const formatDate = (date: Date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}.${m}.${y}`;
  };

  const [tempStart, setTempStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return formatDate(d);
  });
  const [tempEnd, setTempEnd] = useState(() => formatDate(new Date()));

  const [activeCal, setActiveCal] = useState<'start' | 'end' | null>(null);

  useEffect(() => {
    const now = new Date();
    switch (period) {
      case 'today':
        setTempStart(formatDate(now));
        setTempEnd(formatDate(now));
        break;
      case 'yesterday': {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        setTempStart(formatDate(yesterday));
        setTempEnd(formatDate(yesterday));
        break;
      }
      case '7days': {
        const days7 = new Date(now);
        days7.setDate(now.getDate() - 6);
        setTempStart(formatDate(days7));
        setTempEnd(formatDate(now));
        break;
      }
      case '30days': {
        const days30 = new Date(now);
        days30.setDate(now.getDate() - 29);
        setTempStart(formatDate(days30));
        setTempEnd(formatDate(now));
        break;
      }
      case 'thisMonth': {
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        setTempStart(formatDate(thisMonthStart));
        setTempEnd(formatDate(now));
        break;
      }
      case 'allTime':
        setTempStart('01.01.2025');
        setTempEnd(formatDate(now));
        break;
    }
  }, [period]);

  const handleApply = () => {
    setIsPopoverOpen(false);
    if (period === 'custom') {
      onChange?.(diffDays(tempStart, tempEnd));
    }
  };

  return (
    <Flex align="center" gap="16px">
      <Menu>
        <MenuButton
          as={Button}
          bg="white"
          border="1px solid #e2e8f0"
          borderRadius="10px"
          fontSize="14px"
          fontWeight={400}
          color="#12233f"
          _hover={{ bg: '#f8fafc' }}
          _expanded={{
            bg: '#f8fafc',
            borderColor: '#a6c2de',
          }}
          h="40px"
          px="16px"
          w="220px"
          textAlign="left"
        >
          <Flex align="center" justify="space-between" w="100%">
            <Text>{periodOptions.find((o) => o.value === period)?.label}</Text>
            <ChevronDownIcon />
          </Flex>
        </MenuButton>
        <MenuList
          borderRadius="12px"
          py="8px"
          boxShadow="0 4px 20px rgba(0,0,0,0.1)"
          minW="220px"
          zIndex={10}
        >
          {periodOptions.map((opt) => (
            <MenuItem
              key={opt.value}
              onClick={() => {
                setPeriod(opt.value);
                if (opt.value === 'custom') {
                  setIsPopoverOpen(true);
                } else {
                  onChange?.(periodDays[opt.value] ?? 7);
                }
              }}
              bg={period === opt.value ? '#f0f5fa' : 'transparent'}
              _hover={{ bg: '#f8fafc' }}
              fontSize="14px"
              color="#12233f"
              px="16px"
              py="8px"
            >
              {opt.label}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>

      <Popover
        isOpen={isPopoverOpen}
        onClose={() => {
          setIsPopoverOpen(false);
          setActiveCal(null);
        }}
        placement="bottom-start"
        autoFocus={false}
      >
        <PopoverTrigger>
          <Button
            isDisabled={period !== 'custom'}
            variant="outline"
            bg="white"
            borderColor="#e2e8f0"
            borderRadius="10px"
            fontSize="14px"
            fontWeight={400}
            color="#12233f"
            _hover={{
              bg: '#f8fafc',
              borderColor: '#a6c2de',
            }}
            h="40px"
            px="16px"
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ marginRight: '8px' }}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {tempStart} — {tempEnd}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          w="320px"
          borderRadius="12px"
          p="16px"
          boxShadow="0 4px 24px rgba(0,0,0,0.1)"
          border="none"
        >
          <PopoverBody p={0}>
            <Flex gap="12px" mb="16px">
              <Box flex={1} position="relative">
                <Text fontSize="12px" color="#52525b" mb="6px">
                  С даты
                </Text>

                <InputGroup
                  size="sm"
                  cursor="pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveCal(activeCal === 'start' ? null : 'start');
                  }}
                >
                  <Input
                    value={tempStart}
                    readOnly
                    bg={
                      activeCal === 'start'
                        ? '#e2e8f0'
                        : '#f0f5fa'
                    }
                    border="none"
                    borderRadius="8px"
                    fontSize="13px"
                    color="#12233f"
                    cursor="pointer"
                  />
                  <InputRightElement pointerEvents="none">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#52525b"
                      strokeWidth="2"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </InputRightElement>
                </InputGroup>

                {activeCal === 'start' && (
                  <Box
                    position="absolute"
                    top="100%"
                    left="0"
                    mt="4px"
                    zIndex={20}
                    w="240px"
                    p="12px"
                    bg="white"
                    borderRadius="12px"
                    boxShadow="0 4px 24px rgba(0,0,0,0.15)"
                    border="1px solid #e2e8f0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DatePicker
                      selected={tempStart}
                      onSelect={(d) => {
                        setTempStart(d);
                        setActiveCal(null);
                      }}
                    />
                  </Box>
                )}
              </Box>
              <Box flex={1} position="relative">
                <Text fontSize="12px" color="#52525b" mb="6px">
                  По дату
                </Text>

                <InputGroup
                  size="sm"
                  cursor="pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveCal(activeCal === 'end' ? null : 'end');
                  }}
                >
                  <Input
                    value={tempEnd}
                    readOnly
                    bg={
                      activeCal === 'end'
                        ? '#e2e8f0'
                        : '#f0f5fa'
                    }
                    border="none"
                    borderRadius="8px"
                    fontSize="13px"
                    color="#12233f"
                    cursor="pointer"
                  />
                  <InputRightElement pointerEvents="none">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#52525b"
                      strokeWidth="2"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </InputRightElement>
                </InputGroup>

                {activeCal === 'end' && (
                  <Box
                    position="absolute"
                    top="100%"
                    right="0"
                    mt="4px"
                    zIndex={20}
                    w="240px"
                    p="12px"
                    bg="white"
                    borderRadius="12px"
                    boxShadow="0 4px 24px rgba(0,0,0,0.15)"
                    border="1px solid #e2e8f0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DatePicker
                      selected={tempEnd}
                      onSelect={(d) => {
                        setTempEnd(d);
                        setActiveCal(null);
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Flex>
            <Flex justify="flex-end" gap="12px" align="center">
              <Text
                fontSize="13px"
                color="#52525b"
                cursor="pointer"
                onClick={() => {
                  setIsPopoverOpen(false);
                  setActiveCal(null);
                }}
                _hover={{ color: '#12233f' }}
              >
                Отмена
              </Text>
              <Button
                size="sm"
                bg="#3b6ea0"
                color="white"
                borderRadius="8px"
                fontSize="13px"
                fontWeight={500}
                _hover={{ bg: '#34608c' }}
                onClick={handleApply}
              >
                Применить
              </Button>
            </Flex>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  );
}
