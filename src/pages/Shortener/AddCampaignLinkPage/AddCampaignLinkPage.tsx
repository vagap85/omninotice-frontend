import {
  Box,
  Flex,
  Heading,
  Text,
  Input,
  FormControl,
  FormLabel,
  Checkbox,
  Button,
  Select,
  Spinner,
  Tag,
  TagLabel,
  TagCloseButton,
} from '@chakra-ui/react';
import { useState, useMemo, useEffect } from 'react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { useParams, useNavigate } from 'react-router-dom';

import { mockCampaigns, mockLinks } from '@/mocks/shortener';
import {
  fetchCampaign,
  fetchLink,
  fetchTags,
  createLink,
  updateLink,
  isApiConfigured,
} from '@/api/shortener';
import { useToast } from '@chakra-ui/react';
import type { LinkRow, CampaignRow } from '@/types/shortener';
import './AddCampaignLinkPage.scss';

type ChannelField = {
  key: string;
  label: string;
  type: 'text' | 'input' | 'select';
  value?: string;
  placeholder?: string;
  options?: string[];
  default?: string;
};

type Channel = {
  id: string;
  name: string;
  fields: ChannelField[];
};

type ManualChannel = {
  id: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
};

const channelsConfig: Channel[] = [
  {
    id: 'telegram',
    name: 'Telegram',
    fields: [
      {
        key: 'utm_source',
        label: 'utm_source',
        type: 'text',
        value: 'telegram',
      },
      {
        key: 'utm_medium',
        label: 'utm_medium',
        type: 'select',
        options: ['post', 'social'],
        default: 'post',
      },
      {
        key: 'utm_content',
        label: 'utm_content',
        type: 'select',
        options: ['channel_name', 'promo_banner_1'],
        default: 'channel_name',
      },
    ],
  },
  {
    id: 'vk',
    name: 'VK Реклама',
    fields: [
      { key: 'utm_source', label: 'utm_source', type: 'text', value: 'vk_ads' },
      { key: 'utm_medium', label: 'utm_medium', type: 'text', value: 'cpc' },
      {
        key: 'utm_content',
        label: 'utm_content',
        type: 'input',
        placeholder: '{banner_id}',
      },
      {
        key: 'utm_term',
        label: 'utm_term',
        type: 'input',
        placeholder: '{keyword}',
      },
    ],
  },
  {
    id: 'blogers',
    name: 'Блогеры',
    fields: [
      {
        key: 'utm_source',
        label: 'utm_source',
        type: 'select',
        options: ['telegram', 'instagram'],
        default: 'telegram',
      },
      {
        key: 'utm_medium',
        label: 'utm_medium',
        type: 'text',
        value: 'referral',
      },
      {
        key: 'utm_content',
        label: 'utm_content',
        type: 'input',
        placeholder: 'bloger_name',
      },
      {
        key: 'utm_term',
        label: 'utm_term',
        type: 'select',
        options: ['stories', 'post'],
        default: 'stories',
      },
    ],
  },
  {
    id: 'wb',
    name: 'Wildberries',
    fields: [
      { key: 'utm_source', label: 'utm_source', type: 'text', value: 'yandex' },
      { key: 'utm_medium', label: 'utm_medium', type: 'text', value: 'post' },
      {
        key: 'utm_content',
        label: 'utm_content',
        type: 'input',
        placeholder: '{creative}',
      },
      {
        key: 'utm_term',
        label: 'utm_term',
        type: 'input',
        placeholder: '{keyword}',
      },
    ],
  },
  {
    id: 'ozon',
    name: 'Ozon',
    fields: [
      { key: 'utm_source', label: 'utm_source', type: 'text', value: 'yandex' },
      { key: 'utm_medium', label: 'utm_medium', type: 'text', value: 'cpc' },
      {
        key: 'utm_content',
        label: 'utm_content',
        type: 'input',
        placeholder: '{ad_id}',
      },
      {
        key: 'utm_term',
        label: 'utm_term',
        type: 'input',
        placeholder: '{keyword}',
      },
    ],
  },
  {
    id: 'qr',
    name: 'Полиграфия (QR)',
    fields: [
      { key: 'utm_source', label: 'utm_source', type: 'text', value: 'qr' },
      {
        key: 'utm_medium',
        label: 'utm_medium',
        type: 'text',
        value: 'offline',
      },
      {
        key: 'utm_content',
        label: 'utm_content',
        type: 'input',
        placeholder: '{place}',
      },
    ],
  },
];

function BreadcrumbsHeader({ campaignName, pageTitle }: { campaignName: string; pageTitle: string }) {
  const navigate = useNavigate();
  const toast = useToast();
  const notify = useMemo(() => ({ error: (msg: string) => toast({ title: msg, status: 'error', duration: 4000, isClosable: true }), success: (msg: string) => toast({ title: msg, status: 'success', duration: 4000, isClosable: true }) }), [toast]);
  return (
    <Flex align="center" gap={2} fontSize="13px" mb={2} px="32px" pt="20px">
      <Text
        color="#3b6ea0"
        cursor="pointer"
        _hover={{ textDecoration: 'underline' }}
        onClick={() => navigate('/campaigns')}
      >
        Кампании
      </Text>
      <Text color="#a1a1aa">/</Text>
      <Text color="#52525b">{campaignName}</Text>
      <Text color="#a1a1aa">/</Text>
      <Text color="#52525b">{pageTitle}</Text>
    </Flex>
  );
}
export default function AddCampaignLinkPage() {
  const { id, linkId } = useParams<{ id: string; linkId?: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const notify = useMemo(() => ({ error: (msg: string) => toast({ title: msg, status: 'error', duration: 4000, isClosable: true }), success: (msg: string) => toast({ title: msg, status: 'success', duration: 4000, isClosable: true }) }), [toast]);
  const isEditMode = !!linkId;

  // Fallback-кампания для режима без API
  const fallbackCampaign = useMemo(
    () =>
      mockCampaigns.find((c) => c.id === id) || {
        id: id || 'unknown',
        name: 'Летняя распродажа 2026',
      },
    [id],
  );
  const [loadedCampaign, setLoadedCampaign] = useState<CampaignRow | null>(
    null,
  );
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(isApiConfigured);
  // Кампания, в которую добавляется ссылка
  const campaign: Pick<CampaignRow, 'id' | 'name'> =
    loadedCampaign ?? fallbackCampaign;

  useEffect(() => {
    if (!isApiConfigured || !id) return;
    let cancelled = false;
    fetchCampaign(id)
      .then((data) => {
        if (!cancelled) setLoadedCampaign(data);
      })
      .catch((err) => {
        if (!cancelled)
          notify.error(
            `Не удалось загрузить кампанию: ${(err as Error).message}`,
          );
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCampaign(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [linkName, setLinkName] = useState('');
  const [description, setDescription] = useState('');

  // Теги из GET /tags/ (fallback — теги мок-ссылок)
  const [allTags, setAllTags] = useState<string[]>(() =>
    isApiConfigured
      ? []
      : Array.from(new Set(mockLinks.flatMap((l) => l.tags))).sort(),
  );

  useEffect(() => {
    if (!isApiConfigured) return;
    fetchTags()
      .then((items) => setAllTags(items.map((t) => t.name)))
      .catch(() => {
        // список подсказок не критичен
      });
  }, []);

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const [activeUtmTab, setActiveUtmTab] = useState<'template' | 'manual'>(
    'template',
  );
  const [manualChannels, setManualChannels] = useState<ManualChannel[]>([
    {
      id: '1',
      utm_source: '',
      utm_medium: '',
      utm_campaign: 'letnyaya_rasprodazha',
      utm_content: '',
      utm_term: '',
    },
  ]);
  const [manualErrors, setManualErrors] = useState<
    Record<string, Record<string, string>>
  >({});

  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [channelValues, setChannelValues] = useState<
    Record<string, Record<string, string>>
  >(() => {
    const init: Record<string, Record<string, string>> = {};
    channelsConfig.forEach((ch) => {
      init[ch.id] = {};
      ch.fields.forEach((f) => {
        if (f.type === 'text' && f.value) init[ch.id][f.key] = f.value;
        if (f.type === 'select' && f.default) init[ch.id][f.key] = f.default;
      });
    });
    return init;
  });

  const handleToggleChannel = (chId: string) => {
    setSelectedChannels((prev) =>
      prev.includes(chId) ? prev.filter((id) => id !== chId) : [...prev, chId],
    );
  };

  // Заполняет форму данными существующей ссылки (режим редактирования)
  const applyLinkToEdit = (linkToEdit: LinkRow) => {
    setLinkName(linkToEdit.name);
    setDescription(linkToEdit.description);

    try {
      const urlObj = new URL(linkToEdit.targetUrl);
      setUrl(urlObj.origin + urlObj.pathname);

      const searchParams = urlObj.searchParams;
      const channelTag = linkToEdit.tags.find((t) =>
        channelsConfig.some((c) => c.id === t),
      );

      if (channelTag) {
        setActiveUtmTab('template');
        setSelectedChannels([channelTag]);
        setTags(linkToEdit.tags.filter((t) => t !== channelTag));
      } else {
        setActiveUtmTab('manual');
        setTags(linkToEdit.tags);
        if (searchParams.has('utm_source')) {
          setManualChannels([
            {
              id: '1',
              utm_source: searchParams.get('utm_source') || '',
              utm_medium: searchParams.get('utm_medium') || '',
              utm_campaign: searchParams.get('utm_campaign') || '',
              utm_content: searchParams.get('utm_content') || '',
              utm_term: searchParams.get('utm_term') || '',
            },
          ]);
        }
      }
    } catch (e) {
      setUrl(linkToEdit.targetUrl);
      setTags(linkToEdit.tags);
    }
  };

  useEffect(() => {
    if (!(isEditMode && linkId)) return;
    if (isApiConfigured) {
      let cancelled = false;
      fetchLink(linkId)
        .then((linkToEdit) => {
          if (!cancelled) applyLinkToEdit(linkToEdit);
        })
        .catch((err) => {
          if (!cancelled)
            notify.error(
              `Не удалось загрузить ссылку: ${(err as Error).message}`,
            );
        });
      return () => {
        cancelled = true;
      };
    }
    const linkToEdit = mockLinks.find((l) => l.id === linkId);
    if (linkToEdit) applyLinkToEdit(linkToEdit);
  }, [isEditMode, linkId]);

  const handleFieldValueChange = (chId: string, key: string, val: string) => {
    setChannelValues((prev) => ({
      ...prev,
      [chId]: {
        ...prev[chId],
        [key]: val,
      },
    }));
  };

  const validateUrl = (val: string) => {
    if (val && !val.startsWith('http')) {
      setUrlError('Некорректный URL. Проверьте формат URL.');
      return false;
    }
    if (val === 'http://site.ru') {
      setUrlError(
        'Ссылка заблокирована. Перенаправление на данный ресурс запрещено соображениями безопасности.',
      );
      return false;
    }
    setUrlError('');
    return true;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    validateUrl(e.target.value);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,/g, '');
      if (newTag && !tags.includes(newTag) && tags.length < 5) {
        setTags([...tags, newTag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const toggleMockTag = (tag: string) => {
    if (tags.includes(tag)) {
      removeTag(tag);
    } else if (tags.length < 5) {
      setTags([...tags, tag]);
    }
  };

  const handleAddManualChannel = () => {
    setManualChannels((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        utm_source: '',
        utm_medium: '',
        utm_campaign: 'letnyaya_rasprodazha',
        utm_content: '',
        utm_term: '',
      },
    ]);
  };

  const handleManualChange = (
    id: string,
    field: keyof ManualChannel,
    value: string,
  ) => {
    setManualChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, [field]: value } : ch)),
    );
    if (manualErrors[id] && manualErrors[id][field]) {
      setManualErrors((prev) => ({
        ...prev,
        [id]: { ...prev[id], [field]: '' },
      }));
    }
  };

  const validateManual = () => {
    let isValid = true;
    const errors: Record<string, Record<string, string>> = {};
    const utmRegex = /^[a-zA-Z0-9_\-.~]+$/;

    manualChannels.forEach((ch) => {
      errors[ch.id] = {};

      ['utm_source', 'utm_medium', 'utm_campaign'].forEach((field) => {
        const val = ch[field as keyof ManualChannel];
        if (!val) {
          errors[ch.id][field] = 'Поле обязательно для заполнения';
          isValid = false;
        } else if (!utmRegex.test(val as string)) {
          errors[ch.id][field] =
            'Использованы недопустимые спецсимволы в параметрах меток';
          isValid = false;
        }
      });

      ['utm_content', 'utm_term'].forEach((field) => {
        const val = ch[field as keyof ManualChannel];
        if (val && !utmRegex.test(val as string)) {
          errors[ch.id][field] =
            'Использованы недопустимые спецсимволы в параметрах меток';
          isValid = false;
        }
      });
    });

    setManualErrors(errors);
    return isValid;
  };

  const generatePreviewUrl = (chId: string) => {
    const baseUrl = url || 'https://shop.example.ru/sale/summer';
    const values = channelValues[chId] || {};
    const params = new URLSearchParams();

    // Add utm parameters
    if (values['utm_source']) params.append('utm_source', values['utm_source']);
    if (values['utm_medium']) params.append('utm_medium', values['utm_medium']);
    params.append('utm_campaign', 'letnyaya_rasprodazha');
    if (values['utm_content'])
      params.append('utm_content', values['utm_content']);
    if (values['utm_term']) params.append('utm_term', values['utm_term']);

    return `${baseUrl}?${params.toString()}`;
  };

  const handleSubmit = async () => {
    if (!url || urlError) {
      notify.error('Пожалуйста, введите корректный целевой URL');
      return;
    }

    const newLinks: LinkRow[] = [];
    const baseUrl = url || 'https://shop.example.ru/sale/summer';

    if (activeUtmTab === 'template') {
      if (selectedChannels.length === 0) {
        notify.error('Выберите хотя бы один канал');
        return;
      }

      selectedChannels.forEach((chId) => {
        const ch = channelsConfig.find((c) => c.id === chId);
        newLinks.push({
          id: crypto.randomUUID(),
          name: linkName || `${campaign?.name || ''} - ${ch?.name || chId}`,
          description: description || '',
          shortUrl: `omni/${crypto.randomUUID().slice(0, 5)}`,
          targetUrl: generatePreviewUrl(chId),
          campaign: campaign?.name || '',
          tags: [...tags, chId],
          status: 'активна',
          clicks: 0,
        });
      });
    } else {
      if (!validateManual()) {
        notify.error('Пожалуйста, исправьте ошибки в метках');
        return;
      }

      manualChannels.forEach((ch) => {
        const params = new URLSearchParams();
        if (ch.utm_source) params.append('utm_source', ch.utm_source);
        if (ch.utm_medium) params.append('utm_medium', ch.utm_medium);
        if (ch.utm_campaign) params.append('utm_campaign', ch.utm_campaign);
        if (ch.utm_content) params.append('utm_content', ch.utm_content);
        if (ch.utm_term) params.append('utm_term', ch.utm_term);

        newLinks.push({
          id: crypto.randomUUID(),
          name: linkName || `${campaign?.name || ''} - ${ch.utm_source}`,
          description: description || '',
          shortUrl: `omni/${crypto.randomUUID().slice(0, 5)}`,
          targetUrl: `${baseUrl}?${params.toString()}`,
          campaign: campaign?.name || '',
          tags: [...tags],
          status: 'активна',
          clicks: 0,
        });
      });
    }

    // Создание/обновление через API
    if (isApiConfigured && id) {
      try {
        if (isEditMode && linkId) {
          const primary = newLinks[0];
          await updateLink(linkId, {
            title: primary.name,
            target: primary.targetUrl,
            description: primary.description,
            tags: primary.tags,
          });
          for (const extra of newLinks.slice(1)) {
            await createLink({
              title: extra.name,
              target: extra.targetUrl,
              description: extra.description,
              tags: extra.tags,
              campaign_id: id,
            });
          }
          notify.success('Изменения сохранены');
        } else {
          for (const spec of newLinks) {
            await createLink({
              title: spec.name,
              target: spec.targetUrl,
              description: spec.description,
              tags: spec.tags,
              campaign_id: id,
            });
          }
          notify.success(`Создано ${newLinks.length} ссылок для кампании`);
        }
      } catch (err) {
        notify.error(`Не удалось сохранить ссылки: ${(err as Error).message}`);
        return;
      }
      navigate(`/campaigns/${id}`);
      return;
    }

    // Fallback без API — правим моки, как раньше
    if (isEditMode && linkId) {
      const linkIndex = mockLinks.findIndex((l) => l.id === linkId);
      if (linkIndex !== -1) {
        const editedLink = {
          ...mockLinks[linkIndex],
          name: newLinks[0].name,
          description: newLinks[0].description,
          targetUrl: newLinks[0].targetUrl,
          tags: newLinks[0].tags,
        };
        mockLinks.splice(linkIndex, 1, editedLink);
        if (newLinks.length > 1) {
          mockLinks.push(...newLinks.slice(1));
        }
        notify.success('Изменения сохранены');
      }
    } else {
      mockLinks.push(...newLinks);
      notify.success(`Создано ${newLinks.length} ссылок для кампании`);
    }

    navigate(`/campaigns/${campaign?.id || id}`);
  };

  // Пока кампания не загружена — показываем индикатор
  if (isApiConfigured && isLoadingCampaign) {
    return (
      <Box className="add-link-page">
        <BreadcrumbsHeader campaignName='Кампания' pageTitle='Добавить ссылку' />
        <Box className="add-link-page__container" py="80px" textAlign="center">
          <Spinner color="var(--primary)" size="lg" />
        </Box>
      </Box>
    );
  }

  return (
    <Box className="add-link-page">
      <DashboardHeader
        breadcrumbs={[
          { label: 'Кампании', path: '/campaigns' },
          { label: campaign.name, path: `/campaigns/${campaign.id}` },
          {
            label: isEditMode
              ? 'Редактировать ссылку'
              : 'Добавить ссылку в кампанию',
          },
        ]}
      />

      <Box className="add-link-page__container">
        <Heading className="add-link-page__page-title">
          {isEditMode ? 'Редактировать ссылку' : campaign.name}
        </Heading>

        <Box className="add-link-page__card">
          <Heading className="add-link-page__card-title">
            Целевой адрес и разметка
          </Heading>
          <Text className="add-link-page__card-subtitle">
            Один адрес — несколько ссылок: для каждого канала создается своя
            короткая ссылка со своими метками.
          </Text>

          {/* Form Fields */}
          <Box className="add-link-page__form">
            <FormControl isRequired isInvalid={!!urlError}>
              <FormLabel className="add-link-page__label">
                Целевой URL
              </FormLabel>
              <Input
                value={url}
                onChange={handleUrlChange}
                placeholder="https://shop.example.ru/sale/summer"
                className={`add-link-page__input ${urlError ? 'add-link-page__input--error' : ''}`}
              />
              {urlError && (
                <Text className="add-link-page__error-text">{urlError}</Text>
              )}
            </FormControl>

            <FormControl>
              <FormLabel className="add-link-page__label">
                Название ссылки
              </FormLabel>
              <Input
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                placeholder="Например, Пост в Telegram-канале"
                className="add-link-page__input"
              />
              <Text className="add-link-page__help-text">
                Показывается в реестре и участвует в поиске.
              </Text>
            </FormControl>

            <FormControl>
              <FormLabel className="add-link-page__label">
                Описание ссылки
              </FormLabel>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Например, Для отслеживания рекламной кампании по акции «Название акции»"
                className="add-link-page__input"
              />
              <Text className="add-link-page__help-text">
                Показывается в реестре, чтобы вы не забыли назначение ссылки.
              </Text>
            </FormControl>

            <FormControl position="relative">
              <FormLabel className="add-link-page__label">Теги</FormLabel>
              <Flex
                className="add-link-page__tags-input"
                align="center"
                flexWrap="wrap"
                gap={2}
                p="4px 12px"
                onClick={() => document.getElementById('tag-input')?.focus()}
                cursor="text"
              >
                {tags.map((tag) => (
                  <Tag
                    key={tag}
                    size="md"
                    borderRadius="full"
                    variant="solid"
                    colorScheme="blue"
                  >
                    <TagLabel>{tag}</TagLabel>
                    <TagCloseButton
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTag(tag);
                      }}
                    />
                  </Tag>
                ))}
                <Input
                  id="tag-input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  onFocus={() => setShowTagDropdown(true)}
                  onBlur={() =>
                    setTimeout(() => setShowTagDropdown(false), 200)
                  }
                  placeholder={
                    tags.length === 0 ? 'Введите тег и нажмите Enter' : ''
                  }
                  border="none"
                  _focus={{ boxShadow: 'none', bg: 'transparent' }}
                  bg="transparent"
                  flex="1"
                  minW="120px"
                  px={0}
                  height="32px"
                  disabled={tags.length >= 5}
                />
              </Flex>
              {showTagDropdown && (
                <Box
                  as="ul"
                  position="absolute"
                  top="100%"
                  left={0}
                  right={0}
                  zIndex={10}
                  bg="white"
                  boxShadow="md"
                  borderRadius="md"
                  mt={1}
                  maxH="200px"
                  overflowY="auto"
                  border="1px solid var(--slate-200)"
                  listStyleType="none"
                  m={0}
                  p={0}
                  onMouseDown={(e: any) => e.preventDefault()}
                >
                  {allTags.filter((t) =>
                    t.toLowerCase().includes(tagInput.toLowerCase()),
                  ).length === 0 ? (
                    <Box as="li" px={4} py={2} color="gray.500">
                      Нет доступных тегов
                    </Box>
                  ) : (
                    allTags
                      .filter((t) =>
                        t.toLowerCase().includes(tagInput.toLowerCase()),
                      )
                      .map((tag) => (
                        <Flex
                          as="li"
                          key={tag}
                          px={4}
                          py={2}
                          _hover={{ bg: 'blue.50' }}
                          cursor="pointer"
                          align="center"
                          justify="space-between"
                          onClick={() => {
                            toggleMockTag(tag);
                            setTagInput('');
                            document.getElementById('tag-input')?.focus();
                          }}
                        >
                          <Text fontSize="14px" color="var(--slate-700)">
                            {tag}
                          </Text>
                          {tags.includes(tag) && (
                            <Text fontSize="12px" color="blue.500">
                              ✓
                            </Text>
                          )}
                        </Flex>
                      ))
                  )}
                </Box>
              )}
              <Text className="add-link-page__help-text">
                Введите через запятую до 5-ти тегов через Enter или пробел.
              </Text>
            </FormControl>
          </Box>

          {/* UTM Configurator */}
          <Box className="add-link-page__utm-section">
            <Heading className="add-link-page__utm-title">
              Как разметить целевой URL?
            </Heading>
            <Text className="add-link-page__utm-desc">
              Метки показывают в отчетах, из какого канала пришел переход. Для
              основных каналов они уже настроены — просто выберите нужные или
              настройте метки вручную, используя переключатель UTM-конструктора.
            </Text>

            <Flex className="add-link-page__utm-tabs" mb={6}>
              <Box
                className={`add-link-page__utm-tab ${activeUtmTab === 'template' ? 'add-link-page__utm-tab--active' : ''}`}
                onClick={() => setActiveUtmTab('template')}
              >
                По шаблону канала
              </Box>
              <Box
                className={`add-link-page__utm-tab ${activeUtmTab === 'manual' ? 'add-link-page__utm-tab--active' : ''}`}
                onClick={() => setActiveUtmTab('manual')}
              >
                Задать метки вручную
              </Box>
            </Flex>

            {activeUtmTab === 'template' && (
              <>
                {/* Channels Grid */}
                <Box className="add-link-page__channels-grid">
                  {channelsConfig.map((ch) => {
                    const isSelected = selectedChannels.includes(ch.id);
                    return (
                      <Box
                        key={ch.id}
                        className={`add-link-page__channel-card ${isSelected ? 'add-link-page__channel-card--selected' : ''}`}
                      >
                        <Checkbox
                          isChecked={isSelected}
                          onChange={() => handleToggleChannel(ch.id)}
                          className="add-link-page__channel-checkbox"
                        >
                          <Text fontWeight={600} fontSize="14px">
                            {ch.name}
                          </Text>
                        </Checkbox>

                        <Box className="add-link-page__channel-fields">
                          {ch.fields.map((f) => (
                            <Box
                              key={f.key}
                              className="add-link-page__channel-field"
                            >
                              <Text className="add-link-page__channel-field-label">
                                {f.label}
                              </Text>

                              {f.type === 'text' && (
                                <Box className="add-link-page__channel-field-text">
                                  {f.value}
                                </Box>
                              )}

                              {f.type === 'input' && (
                                <Input
                                  size="sm"
                                  placeholder={f.placeholder}
                                  value={channelValues[ch.id]?.[f.key] || ''}
                                  onChange={(e) =>
                                    handleFieldValueChange(
                                      ch.id,
                                      f.key,
                                      e.target.value,
                                    )
                                  }
                                  className="add-link-page__channel-input"
                                  disabled={!isSelected}
                                />
                              )}

                              {f.type === 'select' && (
                                <Select
                                  size="sm"
                                  value={channelValues[ch.id]?.[f.key] || ''}
                                  onChange={(e) =>
                                    handleFieldValueChange(
                                      ch.id,
                                      f.key,
                                      e.target.value,
                                    )
                                  }
                                  className="add-link-page__channel-select"
                                  disabled={!isSelected}
                                >
                                  {f.options?.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </Select>
                              )}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>

                <Text className="add-link-page__summary-text">
                  Выбрано каналов: {selectedChannels.length}. Будет создано
                  столько же ссылок
                </Text>

                {/* Preview Links */}
                {selectedChannels.length > 0 && (
                  <Box className="add-link-page__preview-section">
                    <Heading className="add-link-page__preview-title">
                      Предпросмотр ссылок
                    </Heading>
                    <Flex direction="column" gap={3}>
                      {selectedChannels.map((chId) => {
                        const ch = channelsConfig.find((c) => c.id === chId);
                        return (
                          <Box key={chId}>
                            <Text className="add-link-page__preview-channel">
                              {ch?.name}
                            </Text>
                            <Text className="add-link-page__preview-url">
                              {generatePreviewUrl(chId)}
                            </Text>
                          </Box>
                        );
                      })}
                    </Flex>
                  </Box>
                )}
              </>
            )}

            {activeUtmTab === 'manual' && (
              <Box className="add-link-page__manual-section">
                {manualChannels.map((channel) => (
                  <Box
                    key={channel.id}
                    className="add-link-page__manual-channel-card"
                  >
                    <Flex gap={4} mb={4}>
                      <FormControl
                        isRequired
                        isInvalid={!!manualErrors[channel.id]?.utm_source}
                        flex="1"
                      >
                        <FormLabel className="add-link-page__label">
                          utm_source
                        </FormLabel>
                        <Input
                          value={channel.utm_source}
                          onChange={(e) =>
                            handleManualChange(
                              channel.id,
                              'utm_source',
                              e.target.value,
                            )
                          }
                          placeholder=" "
                          className={`add-link-page__input ${manualErrors[channel.id]?.utm_source ? 'add-link-page__input--error' : ''}`}
                        />
                        {manualErrors[channel.id]?.utm_source ? (
                          <Text className="add-link-page__error-text">
                            {manualErrors[channel.id].utm_source}
                          </Text>
                        ) : (
                          <Text className="add-link-page__help-text">
                            Источник перехода: площадка, сайт, рассылка
                          </Text>
                        )}
                      </FormControl>

                      <FormControl
                        isRequired
                        isInvalid={!!manualErrors[channel.id]?.utm_medium}
                        flex="1"
                      >
                        <FormLabel className="add-link-page__label">
                          utm_medium
                        </FormLabel>
                        <Input
                          value={channel.utm_medium}
                          onChange={(e) =>
                            handleManualChange(
                              channel.id,
                              'utm_medium',
                              e.target.value,
                            )
                          }
                          placeholder=" "
                          className={`add-link-page__input ${manualErrors[channel.id]?.utm_medium ? 'add-link-page__input--error' : ''}`}
                        />
                        {manualErrors[channel.id]?.utm_medium ? (
                          <Text className="add-link-page__error-text">
                            {manualErrors[channel.id].utm_medium}
                          </Text>
                        ) : (
                          <Text className="add-link-page__help-text">
                            Тип трафика. От него зависит, в какую группу каналов
                            попадут переходы
                          </Text>
                        )}
                      </FormControl>

                      <FormControl
                        isRequired
                        isInvalid={!!manualErrors[channel.id]?.utm_campaign}
                        flex="1"
                      >
                        <FormLabel className="add-link-page__label">
                          utm_campaign
                        </FormLabel>
                        <Input
                          value={channel.utm_campaign}
                          onChange={(e) =>
                            handleManualChange(
                              channel.id,
                              'utm_campaign',
                              e.target.value,
                            )
                          }
                          placeholder=" "
                          className={`add-link-page__input ${manualErrors[channel.id]?.utm_campaign ? 'add-link-page__input--error' : ''}`}
                        />
                        {manualErrors[channel.id]?.utm_campaign ? (
                          <Text className="add-link-page__error-text">
                            {manualErrors[channel.id].utm_campaign}
                          </Text>
                        ) : (
                          <Text className="add-link-page__help-text">
                            Подставлено из названия кампании. Можно изменить —
                            на группировку внутри сервиса это не влияет
                          </Text>
                        )}
                      </FormControl>
                    </Flex>

                    <Flex gap={4}>
                      <FormControl
                        isInvalid={!!manualErrors[channel.id]?.utm_content}
                        flex="1"
                      >
                        <FormLabel className="add-link-page__label">
                          utm_content
                        </FormLabel>
                        <Input
                          value={channel.utm_content}
                          onChange={(e) =>
                            handleManualChange(
                              channel.id,
                              'utm_content',
                              e.target.value,
                            )
                          }
                          placeholder="Необязательно"
                          className={`add-link-page__input ${manualErrors[channel.id]?.utm_content ? 'add-link-page__input--error' : ''}`}
                        />
                        {manualErrors[channel.id]?.utm_content ? (
                          <Text className="add-link-page__error-text">
                            {manualErrors[channel.id].utm_content}
                          </Text>
                        ) : (
                          <Text className="add-link-page__help-text">
                            Различает креативы
                          </Text>
                        )}
                      </FormControl>

                      <FormControl
                        isInvalid={!!manualErrors[channel.id]?.utm_term}
                        flex="1"
                      >
                        <FormLabel className="add-link-page__label">
                          utm_term
                        </FormLabel>
                        <Input
                          value={channel.utm_term}
                          onChange={(e) =>
                            handleManualChange(
                              channel.id,
                              'utm_term',
                              e.target.value,
                            )
                          }
                          placeholder="Необязательно"
                          className={`add-link-page__input ${manualErrors[channel.id]?.utm_term ? 'add-link-page__input--error' : ''}`}
                        />
                        {manualErrors[channel.id]?.utm_term ? (
                          <Text className="add-link-page__error-text">
                            {manualErrors[channel.id].utm_term}
                          </Text>
                        ) : (
                          <Text className="add-link-page__help-text">
                            Ключевая фраза
                          </Text>
                        )}
                      </FormControl>

                      <Box flex="1"></Box>
                    </Flex>
                  </Box>
                ))}

                <Flex justify="flex-end" mb={6} mt={2}>
                  <Button
                    variant="ghost"
                    fontSize="13px"
                    fontWeight={500}
                    color="var(--text)"
                    _hover={{ bg: 'transparent', textDecoration: 'underline' }}
                    onClick={handleAddManualChannel}
                  >
                    Добавить канал
                  </Button>
                </Flex>

                <Text className="add-link-page__summary-text">
                  Добавлено каналов: {manualChannels.length}. Будет создано
                  столько же ссылок
                </Text>
              </Box>
            )}
          </Box>
        </Box>

        <Flex justify="flex-end" gap={4} mt={4}>
          <Button
            variant="ghost"
            color="var(--text-secondary)"
            fontWeight={500}
            onClick={() => navigate(`/campaigns/${campaign.id}`)}
          >
            Отмена
          </Button>
          <Button
            bg="var(--primary)"
            color="white"
            fontSize="14px"
            fontWeight={500}
            borderRadius="8px"
            px="24px"
            h="40px"
            _hover={{ bg: 'var(--btn-hover)' }}
            _active={{ bg: 'var(--text-link)' }}
            rightIcon={<ArrowForwardIcon />}
            onClick={handleSubmit}
          >
            {isEditMode ? 'Сохранить изменения' : 'Создать ссылки'}
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
