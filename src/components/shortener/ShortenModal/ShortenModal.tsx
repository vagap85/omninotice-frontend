import { ArrowForwardIcon, ChevronDownIcon, CheckIcon } from '@chakra-ui/icons';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Select,
  Button,
  Tag,
  TagLabel,
  TagCloseButton,
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  IconButton,
  Wrap,
  WrapItem,
  useToast
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';

import {
  createLink,
  ensureCampaignId,
  isApiConfigured,
} from '@/api/shortener';
import { createShortcut } from '@/api/shortenerPublic';
import { mockLinks, mockCampaigns } from '@/mocks/shortener';
import type { LinkRow, ShortenModalProps } from '@/types/shortener';

export type { ShortenModalProps };

const DEFAULT_CAMPAIGNS = [
  'Без кампании',
  ...Array.from(
    new Set([
      ...mockCampaigns.map((c) => c.name),
      ...mockLinks.map((l) => l.campaign),
    ]),
  ).filter((name) => Boolean(name) && name !== 'Без кампании'),
];

const DEFAULT_TAGS = Array.from(
  new Set([
    ...mockLinks.flatMap((l) => l.tags),
    ...mockCampaigns.flatMap((c) => c.tags),
  ]),
)
  .filter(Boolean)
  .sort((a, b) => a.localeCompare(b, 'ru'));

function generateShortCode(): string {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function ShortenModal({
  isOpen,
  onClose,
  onCreated,
  editLink = null,
  onEdited,
  campaigns = DEFAULT_CAMPAIGNS,
  availableTags = DEFAULT_TAGS,
}: ShortenModalProps) {
  const toast = useToast();
  const isEditMode = Boolean(editLink);
  const campaignOptions =
    campaigns && campaigns.length > 0 ? campaigns : DEFAULT_CAMPAIGNS;
  const finalCampaigns = [
    'Без кампании',
    ...campaignOptions.filter((c) => c !== 'Без кампании'),
  ];

  const [targetUrl, setTargetUrl] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [campaign, setCampaign] = useState('Без кампании');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTagFocused, setIsTagFocused] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const tagInputRef = useRef<HTMLInputElement>(null);
  const tagsWrapperRef = useRef<HTMLDivElement>(null);

  const resetForm = () => {
    setTargetUrl('');
    setName('');
    setDescription('');
    setTags([]);
    setTagInput('');
    setCampaign('Без кампании');
    setError(null);
    setIsSubmitting(false);
    setIsDropdownOpen(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Заполнение данными в режиме редактирования
  useEffect(() => {
    const syncForm = () => {
      if (editLink) {
        setTargetUrl(editLink.targetUrl);
        setName(editLink.name);
        setDescription(editLink.description || '');
        setTags(editLink.tags || []);
        setCampaign(editLink.campaign || 'Без кампании');
      } else {
        resetForm();
      }
    };
    syncForm();
     
  }, [editLink, isOpen]);

  // Закрытие dropdown при клике вне тегового контейнера
  useEffect(() => {
    if (!isDropdownOpen) return undefined;
    const handleMouseDown = (e: MouseEvent) => {
      if (
        tagsWrapperRef.current &&
        !tagsWrapperRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isDropdownOpen]);

  const addTag = (value: string) => {
    const trimmed = value.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      removeTag(tag);
    } else if (tags.length < 5) {
      setTags((prev) => [...prev, tag]);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === ',' || e.key === 'Enter') && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const filteredAvailableTags = availableTags.filter(
    (t) =>
      !tags.includes(t) &&
      (!tagInput.trim() ||
        t.toLowerCase().includes(tagInput.trim().toLowerCase())),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!targetUrl.trim()) {
      setError('Введите целевой URL');
      return;
    }

    if (!name.trim()) {
      setError('Введите название ссылки');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && editLink) {
        // Режим редактирования
        const campaignId = isApiConfigured
          ? await ensureCampaignId(campaign)
          : null;

        if (isApiConfigured) {
          const { updateLink } = await import('@/api/shortener');
          await updateLink(editLink.id, {
            title: name.trim(),
            target: targetUrl.trim(),
            description: description.trim(),
            tags,
            campaign_id: campaignId,
          });
        }

        const updatedLink: LinkRow = {
          ...editLink,
          name: name.trim(),
          targetUrl: targetUrl.trim(),
          description: description.trim(),
          tags,
          campaign: campaign === 'Без кампании' ? 'Без кампании' : campaign,
        };

        onEdited?.(updatedLink);
        toast({
          title: 'Ссылка обновлена',
          status: 'success',
          duration: 4000,
          isClosable: true
        });
        handleClose();
      } else {
        // Режим создания
        let newLink: LinkRow;

        if (isApiConfigured) {
          const campaignId = await ensureCampaignId(campaign);
          newLink = await createLink({
            title: name.trim(),
            target: targetUrl.trim(),
            description: description.trim(),
            tags,
            campaign_id: campaignId,
          });
          newLink.campaign = campaign;
        } else {
          // Mock-режим
          const shortData = await createShortcut(targetUrl.trim()).catch(
            () => null,
          );
          const shortCode = shortData?.shortcut || generateShortCode();
          newLink = {
            id: String(Date.now()),
            name: name.trim(),
            description: description.trim(),
            shortUrl: `omni/${shortCode}`,
            shortcut: shortCode,
            targetUrl: targetUrl.trim(),
            campaign,
            tags,
            status: 'active',
            clicks: 0,
            createdAt: new Date().toISOString(),
          };
        }

        onCreated?.(newLink);
        toast({
          title: 'Короткая ссылка создана',
          status: 'success',
          duration: 4000,
          isClosable: true
        });
        handleClose();
      }
    } catch (err) {
      toast({
        title: 'Не удалось сохранить ссылку',
        description: err instanceof Error ? err.message : undefined,
        status: 'error',
        duration: 4000,
        isClosable: true
      });
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="lg">
      <ModalOverlay bg="rgba(18, 35, 63, 0.35)" backdropFilter="blur(4px)" />
      <ModalContent
        borderRadius="16px"
        fontFamily="'Inter', sans-serif"
        boxShadow="0 20px 60px rgba(18, 35, 63, 0.18)"
      >
        <form onSubmit={handleSubmit}>
          <ModalHeader
            fontSize="18px"
            fontWeight={700}
            color="#12233f"
            px="28px"
            pt="24px"
            pb="16px"
            borderBottom="1px solid #e2e8f0"
          >
            {isEditMode ? 'Редактировать ссылку' : 'Создать короткую ссылку'}
          </ModalHeader>
          <ModalCloseButton mt="12px" mr="12px" color="#52525b" />

          <ModalBody px="28px" py="24px">
            <VStack spacing="16px" align="stretch">
              {/* Целевой URL */}
              <FormControl isRequired isInvalid={!!error && !targetUrl.trim()}>
                <FormLabel fontSize="14px" fontWeight={600} color="#12233f" mb="6px">
                  Целевой URL
                </FormLabel>
                <Input
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://example.com/landing-page"
                  h="46px"
                  bg="#f8fafc"
                  borderColor="#e2e8f0"
                  borderRadius="10px"
                  fontSize="14px"
                  color="#12233f"
                  _hover={{ borderColor: '#cbd5e1' }}
                  _focus={{ bg: 'white', borderColor: '#3b6ea0', boxShadow: '0 0 0 1px #3b6ea0' }}
                  isReadOnly={isEditMode}
                  _readOnly={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
                {isEditMode && (
                  <FormHelperText fontSize="12px" color="#64748b" mt="6px">
                    URL нельзя изменить после создания ссылки.
                  </FormHelperText>
                )}
              </FormControl>

              {/* Название */}
              <FormControl isRequired isInvalid={!!error && !name.trim()}>
                <FormLabel fontSize="14px" fontWeight={600} color="#12233f" mb="6px">
                  Название ссылки
                </FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например: Telegram — Черная пятница"
                  h="46px"
                  bg="#f8fafc"
                  borderColor="#e2e8f0"
                  borderRadius="10px"
                  fontSize="14px"
                  color="#12233f"
                  _hover={{ borderColor: '#cbd5e1' }}
                  _focus={{ bg: 'white', borderColor: '#3b6ea0', boxShadow: '0 0 0 1px #3b6ea0' }}
                />
                {error && (
                  <FormErrorMessage fontSize="12px">{error}</FormErrorMessage>
                )}
              </FormControl>

              {/* Описание */}
              <FormControl>
                <FormLabel fontSize="14px" fontWeight={600} color="#12233f" mb="6px">
                  Описание
                </FormLabel>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Краткое описание (необязательно)"
                  h="46px"
                  bg="#f8fafc"
                  borderColor="#e2e8f0"
                  borderRadius="10px"
                  fontSize="14px"
                  color="#12233f"
                  _hover={{ borderColor: '#cbd5e1' }}
                  _focus={{ bg: 'white', borderColor: '#3b6ea0', boxShadow: '0 0 0 1px #3b6ea0' }}
                />
              </FormControl>

              {/* Теги */}
              <FormControl>
                <FormLabel fontSize="14px" fontWeight={600} color="#12233f" mb="6px">
                  Теги
                </FormLabel>
                <Box position="relative" ref={tagsWrapperRef}>
                  <Flex
                    minH="46px"
                    px="12px"
                    py="6px"
                    bg="#f8fafc"
                    border="1px solid"
                    borderColor={isTagFocused ? '#3b6ea0' : '#e2e8f0'}
                    borderRadius="10px"
                    flexWrap="wrap"
                    align="center"
                    gap="6px"
                    cursor="text"
                    boxShadow={isTagFocused ? '0 0 0 1px #3b6ea0' : 'none'}
                    transition="all 0.15s"
                    onClick={() => tagInputRef.current?.focus()}
                    paddingRight="44px"
                  >
                    {tags.map((tag) => (
                      <Tag
                        key={tag}
                        bg="#e6f0fa"
                        color="#2b6cb0"
                        borderRadius="6px"
                        fontSize="12px"
                        fontWeight={500}
                        px="8px"
                        py="3px"
                        size="sm"
                      >
                        <TagLabel>{tag}</TagLabel>
                        <TagCloseButton
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTag(tag);
                          }}
                          color="#2b6cb0"
                          opacity={0.7}
                          _hover={{ opacity: 1 }}
                        />
                      </Tag>
                    ))}
                    <input
                      ref={tagInputRef}
                      value={tagInput}
                      onChange={(e) => {
                        setTagInput(e.target.value);
                        if (!isDropdownOpen) setIsDropdownOpen(true);
                      }}
                      onKeyDown={handleTagKeyDown}
                      onFocus={() => {
                        setIsTagFocused(true);
                        setIsDropdownOpen(true);
                      }}
                      onBlur={() => setIsTagFocused(false)}
                      placeholder={tags.length === 0 ? 'Введите тег...' : ''}
                      style={{
                        flex: 1,
                        minWidth: '120px',
                        height: '32px',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontSize: '14px',
                        color: '#12233f',
                        fontFamily: 'inherit',
                      }}
                    />
                    <IconButton
                      aria-label="Открыть список тегов"
                      icon={<ChevronDownIcon />}
                      position="absolute"
                      right="8px"
                      top="50%"
                      transform="translateY(-50%)"
                      variant="ghost"
                      size="xs"
                      color="#64748b"
                      _hover={{ bg: '#e2e8f0', color: '#12233f' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDropdownOpen((prev) => !prev);
                        tagInputRef.current?.focus();
                      }}
                    />
                  </Flex>

                  {/* Выпадающий список выбора тегов */}
                  {isDropdownOpen && (
                    <Box
                      position="absolute"
                      top="calc(100% + 6px)"
                      left={0}
                      right={0}
                      bg="white"
                      border="1px solid"
                      borderColor="#e2e8f0"
                      borderRadius="12px"
                      boxShadow="0 14px 28px -6px rgba(18, 35, 63, 0.15), 0 4px 10px rgba(18, 35, 63, 0.05)"
                      zIndex={30}
                      p="12px 14px"
                      maxH="230px"
                      overflowY="auto"
                    >
                      <Flex justify="space-between" align="center" mb="8px">
                        <Text fontSize="12px" fontWeight={600} color="#64748b">
                          Доступные теги ({filteredAvailableTags.length})
                        </Text>
                        <Badge
                          colorScheme="blue"
                          variant="subtle"
                          fontSize="11px"
                          borderRadius="full"
                          px="2"
                          py="0.5"
                        >
                          Выбрано: {tags.length} из 5
                        </Badge>
                      </Flex>

                      <Wrap spacing="6px">
                        {filteredAvailableTags.map((tag) => {
                          const isSelected = tags.includes(tag);
                          return (
                            <WrapItem key={tag}>
                              <Button
                                size="xs"
                                variant="outline"
                                borderRadius="8px"
                                fontSize="12px"
                                fontWeight={isSelected ? 600 : 500}
                                bg={isSelected ? '#e6f0fa' : '#f8fafc'}
                                color={isSelected ? '#2b6cb0' : '#12233f'}
                                borderColor={isSelected ? '#bee3f8' : '#e2e8f0'}
                                leftIcon={
                                  isSelected ? (
                                    <CheckIcon boxSize="10px" />
                                  ) : undefined
                                }
                                _hover={{
                                  bg: isSelected ? '#e6f0fa' : '#edf2f7',
                                  borderColor: isSelected ? '#bee3f8' : '#cbd5e1',
                                  color: '#2b6cb0',
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTag(tag);
                                }}
                              >
                                {tag}
                              </Button>
                            </WrapItem>
                          );
                        })}
                      </Wrap>

                      {tagInput.trim() &&
                        !filteredAvailableTags.includes(tagInput.trim()) && (
                          <Box
                            mt="10px"
                            pt="8px"
                            borderTop="1px solid"
                            borderColor="#f1f5f9"
                          >
                            <Button
                              size="sm"
                              variant="ghost"
                              w="100%"
                              justifyContent="flex-start"
                              bg="#f0f7ff"
                              border="1px dashed"
                              borderColor="#bee3f8"
                              color="#2b6cb0"
                              fontSize="13px"
                              fontWeight={500}
                              _hover={{ bg: '#e3effd' }}
                              onClick={() => addTag(tagInput)}
                            >
                              Создать тег: &lt;{tagInput.trim()}&gt;
                            </Button>
                          </Box>
                        )}

                      {filteredAvailableTags.length === 0 && !tagInput.trim() && (
                        <Text
                          py={3}
                          fontSize="13px"
                          color="#94a3b8"
                          textAlign="center"
                        >
                          Нет доступных тегов
                        </Text>
                      )}
                    </Box>
                  )}
                </Box>

                <FormHelperText fontSize="12px" color="#64748b" mt="6px">
                  Выберите из списка или введите тег через запятую/Enter (до 5-ти
                  тегов). Теги удобно разграничивают ссылки.
                </FormHelperText>
              </FormControl>

              {/* Кампания (только в режиме создания) */}
              {!isEditMode && (
                <FormControl>
                  <FormLabel
                    fontSize="14px"
                    fontWeight={600}
                    color="#12233f"
                    mb="6px"
                  >
                    Кампания
                  </FormLabel>
                  <Select
                    value={campaign}
                    onChange={(e) => setCampaign(e.target.value)}
                    h="46px"
                    bg="#f8fafc"
                    borderColor="#e2e8f0"
                    borderRadius="10px"
                    fontSize="14px"
                    color="#12233f"
                    _hover={{ borderColor: '#cbd5e1' }}
                    _focus={{
                      bg: 'white',
                      borderColor: '#3b6ea0',
                      boxShadow: '0 0 0 1px #3b6ea0',
                    }}
                  >
                    {finalCampaigns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                  <FormHelperText fontSize="12px" color="#64748b" mt="6px">
                    Ссылка будет добавлена в выбранную кампанию.
                  </FormHelperText>
                </FormControl>
              )}
            </VStack>
          </ModalBody>

          {/* Кнопки действий */}
          <ModalFooter px="28px" pt="18px" pb="24px">
            <HStack spacing="12px">
              <Button
                variant="ghost"
                color="#12233f"
                fontSize="14px"
                fontWeight={500}
                h="44px"
                px="18px"
                borderRadius="10px"
                _hover={{ bg: '#f1f5f9' }}
                onClick={handleClose}
                isDisabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                bg="#2b6cb0"
                color="white"
                fontSize="14px"
                fontWeight={600}
                h="44px"
                px="22px"
                borderRadius="10px"
                _hover={{ bg: '#235993' }}
                _active={{ bg: '#1c4776' }}
                isLoading={isSubmitting}
                loadingText="Сохранение..."
                rightIcon={<ArrowForwardIcon />}
              >
                {isEditMode ? 'Сохранить изменения' : 'Создать'}
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

export default ShortenModal;
