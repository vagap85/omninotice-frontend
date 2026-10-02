import {
  Button,
  Box,
  Center,
  Container,
  Flex,
  Heading,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Spinner,
  Text
} from '@chakra-ui/react';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { getTemplates } from '@/api/templatesApi';
import cherryIcon from '@/assets/icons/cherry.svg';
import mailIcon from '@/assets/icons/mail.svg';
import maxIcon from '@/assets/icons/max.svg';
import searchIcon from '@/assets/icons/search.svg';
import smsIcon from '@/assets/icons/sms.svg';
import telegramIcon from '@/assets/icons/telegram.svg';
import { ErrorState } from '@/components/molecules/ErrorState/ErrorState';
import { TemplateCard } from '@/components/molecules/TemplateCard/TemplateCard';
import { NotificationTemplate } from '@/types/template';

type ChannelTab = 'cherry' | 'email' | 'sms' | 'telegram' | 'max';

interface TabItem {
  id: ChannelTab;
  label: string;
  icon: string;
  iconSize: number;
  isDisabled?: boolean;
}

const CHANNEL_TABS: TabItem[] = [
  { id: 'cherry', label: 'Вишенка Push', icon: cherryIcon, iconSize: 20 },
  {
    id: 'email',
    label: 'E-mail',
    icon: mailIcon,
    iconSize: 20,
    isDisabled: true
  },
  { id: 'sms', label: 'SMS', icon: smsIcon, iconSize: 20, isDisabled: true },
  {
    id: 'telegram',
    label: 'Telegram',
    icon: telegramIcon,
    iconSize: 20,
    isDisabled: true
  },
  { id: 'max', label: 'Max', icon: maxIcon, iconSize: 20, isDisabled: true }
];

const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ChannelTab>('cherry');

  // 🔁 ОДНА функция загрузки — используется и при монтировании, и при retry
  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(false); // Сбрасываем ошибку перед новой попыткой

    try {
      const data = await getTemplates();
      setTemplates(data);
      setError(false); // Явно подтверждаем успех
    } catch (err) {
      console.error('Ошибка загрузки шаблонов:', err);
      setError(true);
      setTemplates([]); // Очищаем шаблоны при ошибке
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Загрузка при монтировании страницы
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTemplates();
  }, [loadTemplates]);

  // Обработчик кнопки "Повторить"
  const handleRetry = () => {
    loadTemplates(); // Та же функция — тот же результат
  };

  const handleUseTemplate = (template: NotificationTemplate) => {
    navigate(`/create/push?templateId=${template.id}`);
  };

  const filteredTemplates = useMemo(() => {
    let result = templates;

    if (activeTab !== 'cherry') {
      result = result.filter((tpl) => tpl.channel === activeTab);
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((tpl) => {
        const matchName = tpl.name?.toLowerCase().includes(query);
        const matchTitle = tpl.title?.toLowerCase().includes(query);
        const matchBody = tpl.body?.toLowerCase().includes(query);
        return matchName || matchTitle || matchBody;
      });
    }

    return result;
  }, [templates, searchQuery, activeTab]);

  return (
    <Container
      maxW="container.xl"
      as="main"
      bg="#ECF2F8"
      minH="100vh"
      px="40px"
    >
      {/* Липкая шапка */}
      <Box
        position="sticky"
        top="0"
        zIndex={10}
        bg="#ECF2F8"
        pb="32px"
        pt="40px"
      >
        <Heading
          as="h1"
          color="#12233F"
          fontSize="3xl"
          fontWeight="semibold"
          lineHeight="38px"
          mb={6}
        >
          Шаблоны
        </Heading>

        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'stretch', md: 'center' }}
          gap={{ base: 4, md: 6 }}
          w="100%"
        >
          <InputGroup
            flex="1"
            maxW="700px"
            size="md"
          >
            <InputLeftElement
              pointerEvents="none"
              h="100%"
            >
              <Image
                src={searchIcon}
                alt="Поиск"
                boxSize="16px"
                objectFit="contain"
              />
            </InputLeftElement>
            <Input
              bg="#F8FAFC"
              borderRadius="12px"
              color="#A1A1AA"
              fontSize="md"
              fontWeight="normal"
              lineHeight="24px"
              letterSpacing="0"
              h="44px"
              pl="44px"
              placeholder="Поиск по названию или тексту"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              _focus={{
                borderColor: '#346895',
                boxShadow: '0 0 0 1px #346895'
              }}
              _placeholder={{
                color: '#94A3B8',
                fontSize: 'md',
                fontWeight: 'normal',
                lineHeight: '24px'
              }}
            />
          </InputGroup>

          <Flex
            overflowX="auto"
            flexWrap="nowrap"
            gap={2}
            flexShrink={0}
            css={{
              '&::-webkit-scrollbar': { display: 'none' },
              '-ms-overflow-style': 'none',
              'scrollbar-width': 'none'
            }}
          >
            {CHANNEL_TABS.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <Button
                  key={tab.id}
                  bg={isActive ? '#E2EBF3' : '#F8FAFC'}
                  borderColor="#A6C2DE"
                  borderWidth="1px"
                  borderRadius="full"
                  color={isActive ? '#12233F' : '#A1A1AA'}
                  fontSize="sm"
                  fontWeight="medium"
                  lineHeight="20px"
                  letterSpacing="0"
                  isDisabled={tab.isDisabled}
                  px="22px"
                  py="14px"
                  flexShrink={0}
                  whiteSpace="nowrap"
                  leftIcon={
                    <Image
                      alt={tab.label}
                      boxSize={`${tab.iconSize}px`}
                      objectFit="contain"
                      src={tab.icon}
                    />
                  }
                  onClick={() => setActiveTab(tab.id)}
                  _hover={
                    tab.isDisabled
                      ? {}
                      : {
                          bg: '#E2EBF3',
                          borderColor: '#A6C2DE'
                        }
                  }
                  _disabled={{
                    opacity: 0.5,
                    cursor: 'not-allowed'
                  }}
                >
                  {tab.label}
                </Button>
              );
            })}
          </Flex>
        </Flex>
      </Box>

      {/* 🔀 Логика отображения контента */}
      {isLoading ? (
        // 1. Показываем спиннер во время загрузки
        <Center py={20}>
          <Spinner
            color="#346895"
            size="lg"
            thickness="3px"
          />
        </Center>
      ) : error ? (
        // 2. Если была ошибка — показываем ErrorState с кнопкой "Повторить"
        <ErrorState onRetry={handleRetry} />
      ) : filteredTemplates.length === 0 ? (
        // 3. Если шаблонов нет (пустой поиск или фильтр)
        <Center
          flexDirection="column"
          py={20}
        >
          <Text
            color="#64748B"
            fontSize="md"
            mb={2}
          >
            Шаблоны не найдены
          </Text>
          <Text
            color="#94A3B8"
            fontSize="sm"
          >
            Попробуйте изменить поисковый запрос
          </Text>
        </Center>
      ) : (
        // 4. Иначе показываем карточки
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3 }}
          spacing={6}
        >
          {filteredTemplates
            .filter((tpl) => tpl != null)
            .map((tpl) => (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                onUseTemplate={handleUseTemplate}
              />
            ))}
        </SimpleGrid>
      )}
    </Container>
  );
};

export default TemplatesPage;
