import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  SimpleGrid
} from '@chakra-ui/react';
import { useId, useLayoutEffect, useRef } from 'react';
import { LuSmile } from 'react-icons/lu';

import { useFormField } from '@/components/molecules/Form/hooks/useFormField';

const formattingOptions = [
  { label: 'Жирный', tag: 'b', icon: <strong>В</strong> },
  { label: 'Курсив', tag: 'i', icon: <i>/</i> },
  { label: 'Подчёркнутый', tag: 'u', icon: <u>U</u> },
  { label: 'Зачёркнутый', tag: 's', icon: <s>T</s> },
  { label: 'Моноширинный', tag: 'code', icon: <span>M</span> }
];

const emojis = ['😀', '😊', '😍', '👍', '🎉', '❤️', '🔥', '👏', '🙏', '🚀'];

interface TelegramMessageEditorProps {
  name: string;
  label: string;
  placeholder: string;
}

const getPlainText = (html: string) =>
  html
    .replace(/<br\s*\/?>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();

export default function TelegramMessageEditor({
  name,
  label,
  placeholder
}: TelegramMessageEditorProps) {
  const id = useId();
  const editorRef = useRef<HTMLDivElement>(null);
  const { value, error, onChange, onBlur } = useFormField<string>(name, {
    validators: [
      (html) => (getPlainText(html) ? undefined : 'Заполните текст сообщения')
    ]
  });
  const hasText = Boolean(getPlainText(value ?? ''));

  useLayoutEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.innerHTML !== (value ?? '')) {
      editor.innerHTML = value ?? '';
    }
  }, [value]);

  const updateFormValue = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const getEditorRange = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection) return null;

    editor.focus();
    const range =
      selection.rangeCount > 0
        ? selection.getRangeAt(0)
        : document.createRange();
    if (!editor.contains(range.commonAncestorContainer)) {
      range.selectNodeContents(editor);
      range.collapse(false);
    }

    return { editor, range, selection };
  };

  const applyFormatting = (tag: string) => {
    const editorRange = getEditorRange();
    if (!editorRange) return;
    const { range, selection } = editorRange;

    const wrapper = document.createElement(tag);
    const contents = range.extractContents();
    const hadSelection = contents.textContent !== '';
    wrapper.append(contents);
    if (!hadSelection) wrapper.append(document.createTextNode(''));
    range.insertNode(wrapper);

    const nextRange = document.createRange();
    if (hadSelection) {
      nextRange.selectNodeContents(wrapper);
    } else {
      nextRange.setStart(wrapper.firstChild!, 0);
      nextRange.collapse(true);
    }
    selection.removeAllRanges();
    selection.addRange(nextRange);
    updateFormValue();
  };

  const insertEmoji = (emoji: string) => {
    const editorRange = getEditorRange();
    if (!editorRange) return;
    const { range, selection } = editorRange;

    range.deleteContents();
    const textNode = document.createTextNode(emoji);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    updateFormValue();
  };

  return (
    <FormControl isInvalid={Boolean(error)}>
      <FormLabel
        id={`${id}-label`}
        fontSize="18px"
        width="fit-content"
      >
        {label}
      </FormLabel>
      <Box
        ref={editorRef}
        id={id}
        role="textbox"
        aria-multiline="true"
        aria-labelledby={`${id}-label`}
        aria-invalid={Boolean(error)}
        aria-placeholder={placeholder}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        data-empty={!hasText}
        onInput={updateFormValue}
        onBlur={onBlur}
        minH="155px"
        w="full"
        p={3}
        bg="gray.50"
        border="1px solid"
        borderColor={error ? 'red.500' : 'gray.200'}
        borderRadius="10px"
        outline="none"
        _before={{
          content: 'attr(data-placeholder)',
          display: 'block',
          color: 'gray.400',
          pointerEvents: 'none'
        }}
        sx={{
          '&[data-empty="false"]::before': {
            display: 'none'
          }
        }}
        _hover={{ borderColor: error ? 'red.500' : '#3182ce' }}
        _focusVisible={{ borderColor: error ? 'red.500' : '#3182ce' }}
      />

      <HStack
        role="toolbar"
        aria-label="Форматирование сообщения"
        spacing={2}
        mb={3}
        flexWrap="wrap"
      >
        {formattingOptions.map(({ label: optionLabel, tag, icon }) => (
          <IconButton
            key={tag}
            type="button"
            aria-label={optionLabel}
            title={optionLabel}
            icon={icon}
            variant="outline"
            borderColor="gray.200"
            borderRadius="12px"
            bg="gray.50"
            color="#12233F"
            fontSize="28px"
            fontWeight="500"
            w="56px"
            h="56px"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyFormatting(tag)}
          />
        ))}
        <Popover>
          <PopoverTrigger>
            <IconButton
              type="button"
              aria-label="Вставить эмодзи"
              title="Вставить эмодзи"
              icon={
                <Icon
                  as={LuSmile}
                  boxSize={7}
                />
              }
              variant="outline"
              borderColor="gray.200"
              borderRadius="12px"
              bg="gray.50"
              color="#12233F"
              w="56px"
              h="56px"
              onMouseDown={(event) => event.preventDefault()}
            />
          </PopoverTrigger>
          <PopoverContent w="fit-content">
            <PopoverBody>
              <SimpleGrid
                columns={5}
                spacing={1}
              >
                {emojis.map((emoji) => (
                  <IconButton
                    key={emoji}
                    type="button"
                    aria-label={`Вставить ${emoji}`}
                    icon={<span>{emoji}</span>}
                    variant="ghost"
                    fontSize="22px"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => insertEmoji(emoji)}
                  />
                ))}
              </SimpleGrid>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </HStack>
      {error && (
        <FormErrorMessage
          mt={2}
          color="red.500"
          fontSize="xs"
        >
          {error}
        </FormErrorMessage>
      )}
    </FormControl>
  );
}
