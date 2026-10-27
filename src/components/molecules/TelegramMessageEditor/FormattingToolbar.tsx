import { HStack, IconButton } from '@chakra-ui/react';
import type { Editor } from '@tiptap/core';
import { memo, useEffect, useState } from 'react';

import { EmojiPickerPopover } from './EmojiPickerPopover';
import {
  EMPTY_ACTIVE_FORMATS,
  formattingOptions,
  type ActiveFormats,
  type FormattingOption
} from './formattingOptions';

interface FormattingToolbarProps {
  editor: Editor | null;
  onFormat: (format: FormattingOption) => void;
  onInsertEmoji: (emoji: string) => void;
}

function getActiveFormats(editor: Editor): ActiveFormats {
  return Object.fromEntries(
    formattingOptions.map(({ format }) => [format, editor.isActive(format)])
  ) as ActiveFormats;
}

export const FormattingToolbar = memo(function FormattingToolbar({
  editor,
  onFormat,
  onInsertEmoji
}: FormattingToolbarProps) {
  const [activeFormats, setActiveFormats] =
    useState<ActiveFormats>(EMPTY_ACTIVE_FORMATS);

  useEffect(() => {
    if (!editor?.isInitialized) return;

    const updateActiveFormats = () => {
      const nextFormats = getActiveFormats(editor);

      setActiveFormats((currentFormats) =>
        formattingOptions.every(
          ({ format }) => currentFormats[format] === nextFormats[format]
        )
          ? currentFormats
          : nextFormats
      );
    };

    updateActiveFormats();
    editor.on('selectionUpdate', updateActiveFormats);
    editor.on('transaction', updateActiveFormats);

    return () => {
      editor.off('selectionUpdate', updateActiveFormats);
      editor.off('transaction', updateActiveFormats);
    };
  }, [editor]);

  return (
    <HStack
      role="toolbar"
      aria-label="Форматирование сообщения"
      spacing={2}
      mb={3}
      flexWrap="wrap"
    >
      {formattingOptions.map(({ label, format, icon }) => (
        <IconButton
          key={format}
          type="button"
          aria-label={label}
          aria-pressed={activeFormats[format]}
          title={label}
          icon={icon}
          variant="outline"
          borderColor={activeFormats[format] ? 'brand.450' : 'gray.200'}
          borderRadius="5px"
          bg={activeFormats[format] ? 'brand.450' : 'gray.50'}
          color={activeFormats[format] ? 'white' : '#12233F'}
          fontSize="16px"
          fontWeight="500"
          w="32px"
          h="32px"
          _hover={{
            bg: activeFormats[format] ? 'brand.460' : 'gray.100',
            borderColor: activeFormats[format] ? 'brand.460' : 'gray.300'
          }}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onFormat(format)}
        />
      ))}
      <EmojiPickerPopover onSelect={onInsertEmoji} />
    </HStack>
  );
});
