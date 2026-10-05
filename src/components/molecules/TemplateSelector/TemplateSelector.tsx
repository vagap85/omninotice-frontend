import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Input,
  Flex,
  Icon,
  Text,
  useDisclosure,
  VStack,
  Button
} from '@chakra-ui/react';
import {
  LuX,
  LuFileText,
  LuChevronDown,
  LuSearch,
  LuCircleAlert
} from 'react-icons/lu';

import { MOCK_TEMPLATES } from '@/mocks/templates';
import { NotificationTemplate } from '@/types/template';

interface TemplateSelectorProps {
  onSelect: (template: NotificationTemplate | null) => void;
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTemplateId = searchParams.get('templateId') || '';
  const [selectedId, setSelectedId] = useState(initialTemplateId);
  const [searchQuery, setSearchQuery] = useState('');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const initialTemplate = MOCK_TEMPLATES.find(
    (t) => t.id === initialTemplateId
  );

  // ✅ ИСПРАВЛЕНИЕ: Вычисляемое состояние (Derived State).
  // Никакого useState и useEffect не нужно!
  const isLoadFailed = MOCK_TEMPLATES.length === 0;

  // Фильтрация шаблонов по поиску
  const filteredTemplates = MOCK_TEMPLATES.filter((template) => {
    const query = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(query) ||
      template.body.toLowerCase().includes(query)
    );
  });

  // Закрытие при клике вне компонента (это легитимный side-effect)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        onClose();
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Фокус на поиск при открытии (тоже легитимный side-effect)
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSelect = (template: NotificationTemplate) => {
    setSelectedId(template.id);
    onSelect(template);
    setSearchParams({ templateId: template.id });
    onClose();
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedId('');
    onSelect(null);
    setSearchParams({});
    onClose();
  };

  const handleToggle = () => {
    if (isOpen) {
      onClose();
      setSearchQuery('');
    } else {
      onOpen();
    }
  };

  const handleRetry = () => {
    // Здесь в будущем будет реальная логика повторного запроса к API
    // Например: fetchTemplates().catch(() => ...)
    console.log('Повторная загрузка...');
  };

  return (
    <Box
      position="relative"
      mb={4}
      ref={popoverRef}
    >
      {/* Триггер - кликабельная область */}
      <Flex
        align="center"
        bg="#F8FAFC"
        borderRadius="8px"
        border="1px solid"
        borderColor="#E2EBF3"
        cursor="pointer"
        _hover={{ borderColor: '#CBD5E1' }}
        transition="border-color 0.2s"
        px={3}
        py={'10px'}
        onClick={handleToggle}
      >
        <Icon
          as={LuFileText}
          color="#12233F"
          mr="8px"
        />

        <Text
          flex={1}
          fontSize="md"
          color={'#12233F'}
          noOfLines={1}
        >
          {initialTemplate?.name || 'Выбрать из шаблона'}
        </Text>

        {/* Крестик */}
        {selectedId && (
          <Box
            as="button"
            aria-label="Сбросить шаблон"
            w="20px"
            h="20px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="#E2EBF3"
            borderRadius="50%"
            color="#12233F"
            cursor="pointer"
            _hover={{ bg: '#12233F', color: '#E2EBF3' }}
            mr={1}
            onClick={handleClear}
            transition="all 0.2s"
          >
            <LuX size={12} />
          </Box>
        )}

        {/* Стрелка */}
        <Icon
          as={LuChevronDown}
          color="#12233F"
          boxSize={5}
          transform={isOpen ? 'rotate(180deg)' : 'rotate(0)'}
          transition="transform 0.2s"
        />
      </Flex>

      {/* Выпадающий список */}
      {isOpen && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          mt="5px"
          bg="white"
          borderRadius="16px"
          border="1px solid"
          borderColor="#E2E8F0"
          boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
          zIndex={10}
          overflow="hidden"
        >
          {!isLoadFailed && (
            <Box
              borderBottom="1px solid"
              borderColor="#A1A1AA"
            >
              <Flex
                align="center"
                bg="white"
                px="18px"
                py="12px"
              >
                <Icon
                  as={LuSearch}
                  color="#A1A1AA"
                  boxSize={4}
                  mr="8px"
                />
                <Input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по названию или тексту"
                  border="none"
                  bg="transparent"
                  p={0}
                  fontSize="md"
                  _focus={{ boxShadow: 'none' }}
                  _placeholder={{ color: '#A1A1AA' }}
                  onClick={(e) => e.stopPropagation()}
                />
              </Flex>
            </Box>
          )}

          {/* Список шаблонов или ошибка */}
          <VStack
            spacing={0}
            align="stretch"
            maxH="285px"
            overflowY="auto"
            css={{
              '&::-webkit-scrollbar': {
                width: '6px'
              },
              '&::-webkit-scrollbar-track': {
                background: '#F8FAFC'
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#CBD5E1',
                borderRadius: '3px'
              }
            }}
          >
            {isLoadFailed ? (
              // 1. Состояние ошибки загрузки
              <Box
                py="24px"
                textAlign="center"
              >
                <Icon
                  as={LuCircleAlert}
                  w="20px"
                  h="20px"
                  boxSize="20px"
                  color="#EF4444"
                  mb="8px"
                />
                <Text
                  fontSize="sm"
                  color="#64748B"
                  lineHeight="20px"
                >
                  Не удалось загрузить шаблоны.
                </Text>
                <Text
                  fontSize="sm"
                  color="#64748B"
                  mb="10px"
                >
                  Проверьте соединение и повторите.
                </Text>
                <Button
                  variant="outline"
                  borderColor="#3B6EA0"
                  color="#3B6EA0"
                  borderRadius="12px"
                  px="10px"
                  py="8px"
                  fontSize="xs"
                  fontWeight="500"
                  onClick={handleRetry}
                >
                  Повторить
                </Button>
              </Box>
            ) : filteredTemplates.length === 0 ? (
              // 2. Поиск не дал результатов
              <Box
                py="24px"
                textAlign="center"
              >
                <Text
                  fontSize="sm"
                  color="#A1A1AA"
                >
                  Шаблоны не найдены
                </Text>
              </Box>
            ) : (
              // 3. Список найденных шаблонов
              filteredTemplates.map((template) => (
                <Box
                  key={template.id}
                  px={'18px'}
                  py={'14px'}
                  cursor="pointer"
                  _hover={{ bg: '#F8FAFC' }}
                  borderBottom="1px solid"
                  borderColor="#E2E8F0"
                  onClick={() => handleSelect(template)}
                  bg={selectedId === template.id ? '#EBF4FF' : 'white'}
                  transition="background-color 0.15s"
                >
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    lineHeight={'24px'}
                    color="#12233F"
                    mb={'4px'}
                  >
                    {template.name}
                  </Text>
                  <Text
                    fontSize="sm"
                    color="#12233F"
                    noOfLines={2}
                    lineHeight="20px"
                  >
                    {template.body}
                  </Text>
                </Box>
              ))
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
}

export default TemplateSelector;
