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
import { ROUTES } from '@/routing/routes';
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

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(false);

    try {
      const data = await getTemplates();
      setTemplates(data);
      setError(false);
    } catch (err) {
      console.error('Ошибка загрузки шаблонов:', err);
      setError(true);
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTemplates();
  }, [loadTemplates]);

  const handleRetry = () => {
    loadTemplates();
  };

  const handleUseTemplate = (template: NotificationTemplate) => {
    navigate(`${ROUTES.createPush}?templateId=${template.id}`);
  };

  const filteredTemplates = useMemo(() => {
    let result = templates;

    if (activeTab !== 'cherry') {
      result = result.filter((tpl) => tpl.channel === activeTab);
    }

    const query = searchQuery.toLowerCase().replace(/\s+/g, '');

    if (!query) {
      return result;
    }

    result = result.filter((tpl) => {
      const normalizedName = tpl.name?.toLowerCase().replace(/\s+/g, '') || '';
      const normalizedTitle =
        tpl.title?.toLowerCase().replace(/\s+/g, '') || '';
      const normalizedBody = tpl.body?.toLowerCase().replace(/\s+/g, '') || '';

      return (
        normalizedName.includes(query) ||
        normalizedTitle.includes(query) ||
        normalizedBody.includes(query)
      );
    });

    return result;
  }, [templates, searchQuery, activeTab]);

  return (
    <Container
      maxW="none"
      bg="#ECF2F8"
      minH="100vh"
      py="40px"
      px={'clamp(24px, 2vw, 40px)'}
    >
      {/* Липкая шапка */}
      <Box
        position="sticky"
        top="0"
        zIndex={10}
        bg="#ECF2F8"
        pt="10px"
        pb="32px"
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
          flexWrap={'wrap'}
        >
          <InputGroup
            flex={{ base: 'none', md: '1' }}
            w={{ base: '100%', md: 'auto' }}
            maxW="984px"
            size="md"
            h="44px"
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
                ml="18px"
              />
            </InputLeftElement>
            <Input
              bg="#F8FAFC"
              borderRadius="10px"
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
              minW={'200px'}
            />
          </InputGroup>

          <Flex
            w={{ base: '100%', md: 'auto' }}
            overflowX="auto"
            flexWrap="wrap"
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

      {isLoading ? (
        <Center py={20}>
          <Spinner
            color="#346895"
            size="lg"
            thickness="3px"
          />
        </Center>
      ) : error ? (
        <ErrorState onRetry={handleRetry} />
      ) : filteredTemplates.length === 0 ? (
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
        <SimpleGrid
          gridTemplateColumns={
            'repeat(auto-fit, minmax(max(400px, calc(100vw / 3.84)), 1fr))'
          }
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
