import type { JSONContent } from '@tiptap/core';

import { FormTextAreaField } from '../Form/Elements/FormTextAreaField';
import { getTelegramMessageText } from '../helpers/telegramMessageFormat';

import { TelegramEditorControl } from './TelegramEditorControl';

const EMPTY_DOCUMENT: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }]
};

interface TelegramMessageEditorProps {
  name: string;
  label: string;
  placeholder: string;
}

export default function TelegramMessageEditor({
  name,
  label,
  placeholder
}: TelegramMessageEditorProps) {
  return (
    <FormTextAreaField<JSONContent>
      name={name}
      label={label}
      placeholder={placeholder}
      initialValue={EMPTY_DOCUMENT}
      validators={[
        (content) =>
          getTelegramMessageText(content).trim()
            ? undefined
            : 'Заполните текст сообщения'
      ]}
      renderControl={(field) => (
        <TelegramEditorControl
          {...field}
          placeholder={placeholder}
        />
      )}
      minH="155px"
      w="full"
      p={3}
      mb={1.5}
      bg="gray.50"
      border="1px solid"
      borderRadius="10px"
      outline="none"
      _focusWithin={{ borderColor: '#3182ce' }}
      sx={{
        '& .ProseMirror': {
          minHeight: '129px',
          minWidth: 0,
          maxWidth: '100%',
          outline: 'none',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word'
        },
        '& .ProseMirror p': {
          margin: 0,
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word'
        },
        '& .ProseMirror p.is-editor-empty:first-of-type::before': {
          color: 'var(--chakra-colors-gray-400)',
          content: 'attr(data-placeholder)',
          float: 'left',
          height: 0,
          pointerEvents: 'none'
        }
      }}
    />
  );
}
