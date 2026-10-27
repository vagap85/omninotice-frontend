import { Box } from '@chakra-ui/react';
import type { Editor, JSONContent } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import { useCallback, useEffect, useId } from 'react';

import { createTelegramMessageExtensions } from '../helpers/telegramMessageExtensions';
import type { FormTextAreaFieldControlProps } from '../types/form';

import { type FormattingOption } from './formattingOptions';
import { FormattingToolbar } from './FormattingToolbar';

interface TelegramEditorControlProps extends FormTextAreaFieldControlProps<JSONContent> {
  placeholder: string;
}

export function TelegramEditorControl({
  value,
  error,
  onChange,
  onBlur,
  labelId,
  controlProps,
  placeholder
}: TelegramEditorControlProps) {
  const id = useId();

  const updateFormValue = useCallback(
    ({ editor }: { editor: Editor }) => {
      onChange(editor.getJSON());
    },
    [onChange]
  );

  const editor = useEditor(
    {
      extensions: createTelegramMessageExtensions(placeholder),
      content: value,
      onUpdate: updateFormValue,
      onBlur,
      editorProps: {
        attributes: {
          id,
          role: 'textbox',
          'aria-multiline': 'true',
          'aria-labelledby': labelId ?? '',
          'aria-placeholder': placeholder
        }
      },
      shouldRerenderOnTransaction: false
    },
    [id, placeholder]
  );

  useEffect(() => {
    if (!editor?.isInitialized) return;

    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(value)) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  const applyFormatting = useCallback(
    (format: FormattingOption) => {
      if (!editor) return;

      const chain = editor.chain().focus();
      switch (format) {
        case 'bold':
          chain.toggleBold().run();
          break;
        case 'italic':
          chain.toggleItalic().run();
          break;
        case 'underline':
          chain.toggleUnderline().run();
          break;
        case 'strike':
          chain.toggleStrike().run();
          break;
        case 'code':
          chain.toggleCode().run();
          break;
      }
    },
    [editor]
  );

  const insertEmoji = useCallback(
    (emoji: string) => {
      editor?.chain().focus().insertContent(emoji).run();
    },
    [editor]
  );

  return (
    <>
      <Box
        {...controlProps}
        minH="155px"
        w="full"
        p={3}
        borderRadius="10px"
        outline="none"
        aria-invalid={Boolean(error)}
        _focusWithin={{ borderColor: error ? 'red.500' : '#3182ce' }}
      >
        <EditorContent editor={editor} />
      </Box>
      <FormattingToolbar
        editor={editor}
        onFormat={applyFormatting}
        onInsertEmoji={insertEmoji}
      />
    </>
  );
}
