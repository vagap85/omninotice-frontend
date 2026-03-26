import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  Text,
  VStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Select,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'
import { AddIcon, ViewIcon, SmallCloseIcon, CloseIcon } from '@chakra-ui/icons'
// import { sendEventEmail } from '../api/synora'
import ColorPickerPopover from '../components/ColorPickerPopover'
import { isValidRecipient } from '../utils/recipient'
import { sendEmailJs } from '../api/emailJs'

const FONT_SIZES = ['12', '14', '16', '18', '20', '24'] as const
const FONT_SIZE_TO_EXEC = { '12': '1', '14': '2', '16': '3', '18': '4', '20': '5', '24': '6' } as const
const QUICK_GROUPS = [
  { id: 'all', label: 'Все сотрудники' },
  { id: 'sales', label: 'Отдел продаж' },
  { id: 'vip', label: 'VIP клиенты' },
] as const

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
function isEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim())
}
function isPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

export default function CreateNotification() {
  const toast = useToast()
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure()
  const bodyEditorRef = useRef<HTMLDivElement>(null)
  const savedRangeRef = useRef<Range | null>(null)
  const [previewBodyHtml, setPreviewBodyHtml] = useState('')

  const [title, setTitle] = useState('')
  const [fontSize, setFontSize] = useState<string>('16')
  const [textColor, setTextColor] = useState('#10f48a')
  const [formatBold, setFormatBold] = useState(false)
  const [formatItalic, setFormatItalic] = useState(false)
  const [formatUnderline, setFormatUnderline] = useState(false)
  const [recipients, setRecipients] = useState<string[]>([])
  const [newRecipient, setNewRecipient] = useState('')
  const [selectedQuickGroups, setSelectedQuickGroups] = useState<Set<string>>(new Set())
  const [sending, setSending] = useState(false)

  const saveSelection = useCallback(() => {
    const sel = window.getSelection()
    if (sel && bodyEditorRef.current && bodyEditorRef.current.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null
    }
  }, [])

  const restoreSelection = useCallback(() => {
    if (!savedRangeRef.current || !bodyEditorRef.current) return
    const sel = window.getSelection()
    if (sel) {
      sel.removeAllRanges()
      sel.addRange(savedRangeRef.current!)
    }
  }, [])

  const applyToSelection = useCallback((cmd: string, value?: string) => {
    bodyEditorRef.current?.focus()
    restoreSelection()
    document.execCommand('styleWithCSS', false, 'true')
    if (value !== undefined) document.execCommand(cmd, false, value)
    else document.execCommand(cmd, false)
  }, [restoreSelection])

  const handleFormatBold = useCallback(() => {
    applyToSelection('bold')
    setFormatBold((b) => !b)
  }, [applyToSelection])

  const handleFormatItalic = useCallback(() => {
    applyToSelection('italic')
    setFormatItalic((i) => !i)
  }, [applyToSelection])

  const handleFormatUnderline = useCallback(() => {
    applyToSelection('underline')
    setFormatUnderline((u) => !u)
  }, [applyToSelection])

  const handleFontSizeChange = useCallback((value: string) => {
    setFontSize(value)
    if (savedRangeRef.current && bodyEditorRef.current) {
      const execValue = FONT_SIZE_TO_EXEC[value as keyof typeof FONT_SIZE_TO_EXEC] ?? '3'
      applyToSelection('fontSize', execValue)
    }
  }, [applyToSelection])

  const syncToolbarFromSelection = useCallback(() => {
    const sel = window.getSelection()
    if (sel && bodyEditorRef.current && bodyEditorRef.current.contains(sel.anchorNode)) {
      setFormatBold(document.queryCommandState('bold'))
      setFormatItalic(document.queryCommandState('italic'))
      setFormatUnderline(document.queryCommandState('underline'))
    }
  }, [])

  useEffect(() => {
    if (!bodyEditorRef.current) return
    bodyEditorRef.current.innerHTML = ''
  }, [])

  const addRecipient = useCallback(() => {
    const value = newRecipient.trim()
    if (!value) return
    if (!isEmail(value) && !isPhone(value)) {
      toast({ title: 'Введите email или номер телефона (10–15 цифр)', status: 'warning', duration: 4000 })
      return
    }
    if (recipients.includes(value)) {
      toast({ title: 'Контакт уже добавлен', status: 'info', duration: 2000 })
      return
    }
    setRecipients((prev) => [...prev, value])
    setNewRecipient('')
  }, [newRecipient, recipients, toast])

  const removeRecipient = useCallback((value: string) => {
    setRecipients((prev) => prev.filter((r) => r !== value))
  }, [])

  const toggleQuickGroup = useCallback((id: string) => {
    setSelectedQuickGroups((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handlePreview = useCallback(() => {
    setPreviewBodyHtml(bodyEditorRef.current?.innerHTML ?? '')
    onPreviewOpen()
  }, [onPreviewOpen])

  const handleSave = useCallback(() => {
    const bodyHtml = bodyEditorRef.current?.innerHTML ?? ''
    const payload = { title, body: bodyHtml, fontSize, textColor, recipients: [...recipients], quickGroups: [...selectedQuickGroups] }
    try {
      localStorage.setItem('omninotice_draft', JSON.stringify(payload))
      toast({ title: 'Черновик сохранён', status: 'success', duration: 2000 })
    } catch {
      toast({ title: 'Не удалось сохранить', status: 'error' })
    }
  }, [title, fontSize, textColor, recipients, selectedQuickGroups, toast])

  const handleSend = useCallback(async () => {
    if (!title.trim()) {
      toast({ title: 'Введите заголовок уведомления', status: 'warning' })
      return
    }
    const validRecipients = recipients.filter(isValidRecipient)
    if (validRecipients.length === 0) {
      toast({ title: 'Добавьте получателя (email или телефон)', status: 'warning', duration: 3000 })
      return
    }

    const bodyText = bodyEditorRef.current?.innerText ?? ''
    setSending(true)
    // const eventTopic = import.meta.env.VITE_SYNORA_EVENT_TOPIC ?? 'omninotice_notification'

    try {
      for (const sendTo of validRecipients) {
        await sendEmailJs({
          to_email: sendTo,
          title: title,
          message: bodyText,
        });
      }
      toast({ title: 'Уведомления отправлены', status: 'success' })
      setTitle('')
      if (bodyEditorRef.current) bodyEditorRef.current.innerHTML = ''
      setRecipients([])
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ошибка отправки'
      toast({ title: 'Ошибка отправки', description: message, status: 'error', isClosable: true })
    } finally {
      setSending(false)
    }
  }, [title, recipients, textColor, fontSize, toast])

  return (
    <Box minH="100vh" bg="lavender.50" pt={6}>
      <Box maxW="1400px" mx="auto" px={6} pb={0}>
        <Box bg="brand.500" py={6} px={6} borderRadius="xl">
          <Heading as="h1" size="lg" color="white" textAlign="left">
            Создание уведомления
          </Heading>
        </Box>
      </Box>

      <Flex maxW="1400px" mx="auto" p={6} gap={6} flexWrap={{ base: 'wrap', xl: 'nowrap' }} align="stretch">
        {/* Left: Оформление */}
        <Box
          flex="0 0 280px"
          bg="white"
          borderRadius="xl"
          p={6}
          boxShadow="sm"
        >
          <Heading as="h2" size="sm" mb={4} color="brand.700">
            Оформление
          </Heading>
          <VStack align="stretch" spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm" color="brand.700">
                Размер шрифта
              </FormLabel>
              <Select
                value={fontSize}
                onChange={(e) => handleFontSizeChange(e.target.value)}
                size="sm"
                borderColor="brand.500"
                borderRadius="lg"
              >
                {FONT_SIZES.map((s) => (
                  <option key={s} value={s}>{s}px</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" color="brand.700">
                Форматирование текста
              </FormLabel>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant={formatBold ? 'solid' : 'outline'}
                  colorScheme={formatBold ? 'brand' : undefined}
                  borderColor="brand.500"
                  fontWeight="bold"
                  minW="36px"
                  onClick={handleFormatBold}
                >
                  B
                </Button>
                <Button
                  size="sm"
                  variant={formatItalic ? 'solid' : 'outline'}
                  colorScheme={formatItalic ? 'brand' : undefined}
                  borderColor="brand.500"
                  fontStyle="italic"
                  minW="36px"
                  onClick={handleFormatItalic}
                >
                  I
                </Button>
                <Button
                  size="sm"
                  variant={formatUnderline ? 'solid' : 'outline'}
                  colorScheme={formatUnderline ? 'brand' : undefined}
                  borderColor="brand.500"
                  textDecoration="underline"
                  minW="36px"
                  onClick={handleFormatUnderline}
                >
                  U
                </Button>
              </HStack>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Выделите текст и нажмите кнопку
              </Text>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" color="brand.700">
                Цвет текста
              </FormLabel>
              <ColorPickerPopover value={textColor} onChange={setTextColor} label="Цвет текста" />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" color="brand.700">
                Предпросмотр стиля
              </FormLabel>
              <Box
                bg="lavender.50"
                borderRadius="lg"
                p={4}
              >
                <Text
                  fontSize={`${fontSize}px`}
                  color={textColor}
                  fontWeight={formatBold ? 'bold' : 'normal'}
                  fontStyle={formatItalic ? 'italic' : 'normal'}
                  textDecoration={formatUnderline ? 'underline' : 'none'}
                >
                  Пример текста
                </Text>
              </Box>
            </FormControl>
          </VStack>
        </Box>

        {/* Center: Контент */}
        <Box
          flex="1"
          minW="320px"
          bg="white"
          borderRadius="xl"
          p={6}
          boxShadow="sm"
          borderWidth="1px"
          borderColor="lavender.200"
        >
          <VStack align="stretch" spacing={4} h="full">
            <FormControl>
              <FormLabel fontSize="sm" color="brand.700">
                Заголовок уведомления
              </FormLabel>
              <Input
                placeholder="Введите заголовок..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                borderColor="brand.500"
                _placeholder={{ color: 'gray.400' }}
              />
            </FormControl>
            <FormControl flex="1">
              <FormLabel fontSize="sm" color="brand.700">
                Основная часть
              </FormLabel>
              <Box
                ref={bodyEditorRef}
                contentEditable
                suppressContentEditableWarning
                minH="200px"
                p={3}
                borderWidth="1px"
                borderColor="brand.500"
                borderRadius="md"
                fontSize={`${fontSize}px`}
                color={textColor}
                _focus={{ outline: 'none', borderColor: 'brand.600', boxShadow: '0 0 0 1px var(--chakra-colors-brand-600)' }}
                onSelect={saveSelection}
                onMouseUp={syncToolbarFromSelection}
                onKeyUp={syncToolbarFromSelection}
                sx={{ resize: 'vertical' as const, overflow: 'auto' }}
              />
            </FormControl>
            <HStack spacing={3} pt={2} flexWrap={{ base: 'wrap', xl: 'nowrap' }} rowGap={3}>
              <Button
                variant="primary"
                onClick={handleSend}
                isLoading={sending}
                flex={{ base: '1 1 100%', sm: '1 1 140px', xl: '0 0 auto' }}
                whiteSpace={{ base: 'normal', xl: 'nowrap' }}
                lineHeight="short"
              >
                Отправить
              </Button>
              <Button
                variant="secondary"
                leftIcon={<ViewIcon />}
                onClick={handlePreview}
                flex={{ base: '1 1 100%', sm: '1 1 140px', xl: '0 0 auto' }}
                whiteSpace={{ base: 'normal', xl: 'nowrap' }}
                lineHeight="short"
              >
                Предпросмотр
              </Button>
              <Button
                variant="secondary"
                onClick={handleSave}
                flex={{ base: '1 1 100%', sm: '1 1 140px', xl: '0 0 auto' }}
                whiteSpace={{ base: 'normal', xl: 'nowrap' }}
                lineHeight="short"
              >
                Сохранить
              </Button>
            </HStack>
          </VStack>
        </Box>

        {/* Right: Контакты */}
        <Box
          flex="0 0 320px"
          bg="white"
          borderRadius="xl"
          p={6}
          boxShadow="sm"
          borderWidth="1px"
          borderColor="lavender.200"
        >
          <Heading as="h2" size="sm" mb={4} color="brand.700">
            Контакты
          </Heading>
          <VStack align="stretch" spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm" color="brand.700">
                Добавить получателя
              </FormLabel>
              <HStack>
                <Input
                  placeholder="Email или телефон"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addRecipient()}
                  borderColor="brand.500"
                  _placeholder={{ color: 'gray.400' }}
                />
                <IconButton
                  aria-label="Добавить"
                  icon={<AddIcon />}
                  variant="primary"
                  onClick={addRecipient}
                />
              </HStack>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" color="brand.700">
                Получатели ({recipients.length})
              </FormLabel>
              {recipients.length === 0 ? (
                <Text fontSize="sm" color="gray.500">
                  Контакты не добавлены
                </Text>
              ) : (
                <VStack align="stretch" spacing={2}>
                  {recipients.map((r) => (
                    <HStack
                      key={r}
                      as="button"
                      type="button"
                      w="100%"
                      bg="lavender.50"
                      color="brand.700"
                      justifyContent="flex-start"
                      p={2}
                      borderRadius="md"
                      _hover={{ bg: 'lavender.200' }}
                      onClick={() => removeRecipient(r)}
                      textAlign="left"
                    >
                      <Text flex={1} noOfLines={1} fontSize="sm">
                        {r}
                      </Text>
                      <SmallCloseIcon boxSize={4} flexShrink={0} aria-label="Удалить" />
                    </HStack>
                  ))}
                </VStack>
              )}
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" color="brand.700">
                Быстрые группы
              </FormLabel>
              <VStack align="stretch" spacing={2}>
                {QUICK_GROUPS.map((g) => (
                  <Button
                    key={g.id}
                    size="sm"
                    variant="ghost"
                    bg={selectedQuickGroups.has(g.id) ? 'lavender.200' : 'lavender.50'}
                    color="brand.700"
                    justifyContent="flex-start"
                    onClick={() => toggleQuickGroup(g.id)}
                    _hover={{ bg: 'lavender.200' }}
                  >
                    {g.label}
                  </Button>
                ))}
              </VStack>
            </FormControl>
          </VStack>
        </Box>
      </Flex>

      {/* Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <Box position="relative" pt={2} pr={2}>
            <ModalHeader pr={12}>Предпросмотр уведомления</ModalHeader>
            <IconButton
              aria-label="Закрыть"
              icon={<CloseIcon />}
              size="sm"
              position="absolute"
              top={3}
              right={3}
              borderRadius="full"
              bg="lavender.100"
              color="brand.700"
              _hover={{ bg: 'lavender.200' }}
              onClick={onPreviewClose}
            />
          </Box>
          <ModalBody pb={6}>
            <Box bg="lavender.50" p={4} borderRadius="lg" borderWidth="1px" borderColor="lavender.200" mb={4}>
              <Heading size="md" mb={3} color="brand.700">
                {title || 'Заголовок уведомления'}
              </Heading>
              <Box
                fontSize={`${fontSize}px`}
                color={textColor}
                whiteSpace="pre-wrap"
                sx={{ '& b': { fontWeight: 'bold' }, '& i': { fontStyle: 'italic' }, '& u': { textDecoration: 'underline' } }}
                dangerouslySetInnerHTML={{ __html: previewBodyHtml || '<span style="color:gray">Основная часть текста...</span>' }}
              />
            </Box>
            <Flex justify="center">
              <Button variant="primary" borderRadius="0.375rem" px={8} onClick={onPreviewClose}>
                Закрыть
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}
