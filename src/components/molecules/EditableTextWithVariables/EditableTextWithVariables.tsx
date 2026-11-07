import { Box, Input, Text } from '@chakra-ui/react';
import { useState } from 'react';

import { countMeaningfulLength } from '@/utils/meaningfulLength';

interface EditableTextWithVariablesProps {
  text: string;
  variableValues: Record<string, string>;
  onVariableChange: (variable: string, value: string) => void;
  onTextChange: (text: string) => void;
  onTextInput?: (text: string) => void;
  placeholder?: string;
  minH?: string;
  maxLength?: number;
}

function EditableTextWithVariables({
  text,
  variableValues,
  onVariableChange,
  onTextChange,
  onTextInput,
  placeholder,
  maxLength = 200
}: EditableTextWithVariablesProps) {
  const [editingPart, setEditingPart] = useState<{
    key: string;
    value: string;
  } | null>(null);

  // Парсим текст на части: обычный текст и переменные
  const parseText = (text: string) => {
    const parts: Array<{
      type: 'text' | 'variable';
      content: string;
      key: string;
    }> = [];
    const regex = /\{\{([^}]+)\}\}/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index),
          key: `text-${lastIndex}`
        });
      }
      parts.push({
        type: 'variable',
        content: match[1],
        key: `var-${match.index}`
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex),
        key: `text-${lastIndex}`
      });
    }

    return parts;
  };

  const parts = parseText(text);
  const getTextWithDraft = (key: string, value: string) =>
    parts
      .map((part) => {
        if (part.type === 'variable') return `{{${part.content}}}`;
        return part.key === key ? value : part.content;
      })
      .join('');
  const currentText = editingPart
    ? getTextWithDraft(editingPart.key, editingPart.value)
    : text;
  const currentLength = countMeaningfulLength(
    currentText.replace(/\{\{([^}]+)\}\}/g, (_, variableName: string) => {
      return variableValues[variableName] || '';
    })
  );
  const isOverLimit = currentLength > maxLength;

  // Обработчик изменения переменной
  const handleVariableInput = (
    variable: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onVariableChange(variable, e.target.value);
  };

  // Обработчик изменения обычного текста
  const handleTextBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    const changedPartKey = `text-${e.currentTarget.dataset.index}`;
    const fullText = getTextWithDraft(
      changedPartKey,
      e.currentTarget.innerText
    );
    onTextChange(fullText);
    onTextInput?.(fullText);
    setEditingPart(null);
  };

  const handleTextInput = (e: React.FormEvent<HTMLSpanElement>) => {
    const key = `text-${e.currentTarget.dataset.index}`;
    const value = e.currentTarget.innerText;
    setEditingPart({ key, value });
    onTextInput?.(getTextWithDraft(key, value));
  };

  return (
    <>
      <Box
        position="relative"
        p="10px"
        pr="57px"
        bg="#F8FAFC"
        borderRadius="8px"
        fontSize="md"
        lineHeight="24px"
        color="#12233F"
        whiteSpace="pre-wrap"
        wordBreak="break-word"
        cursor="text"
        _hover={{ borderColor: '#CBD5E1' }}
        transition="border-color 0.2s"
        border="1px solid"
        borderColor={isOverLimit ? 'red.500' : '#E2E8F0'}
        minH="155px"
      >
        <Box
          position="absolute"
          top="10px"
          right="11px"
          fontSize="md"
          color={isOverLimit ? 'red.500' : '#A1A1AA'}
          fontWeight="normal"
          userSelect="none"
          pointerEvents="none"
        >
          {currentLength}/{maxLength}
        </Box>

        {parts.length === 0 && placeholder && (
          <Box color="#A1A1AA">{placeholder}</Box>
        )}

        {parts.map((part) => {
          if (part.type === 'text') {
            return (
              <span
                key={part.key}
                contentEditable
                suppressContentEditableWarning
                data-index={part.key.replace('text-', '')}
                onBlur={handleTextBlur}
                onInput={handleTextInput}
                style={{
                  outline: 'none',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {part.content}
              </span>
            );
          } else {
            return (
              <Input
                key={part.key}
                value={variableValues[part.content] || ''}
                onChange={(e) => handleVariableInput(part.content, e)}
                placeholder={`{{${part.content}}}`}
                display="inline-block"
                minW="20px"
                width="auto"
                fontSize="sm"
                px="8px"
                py="2px"
                bg="transparent"
                mx="8px"
                h="24px"
                border="1px dashed"
                borderColor={isOverLimit ? '#EF4444' : '#3B6EA0'}
                borderRadius="6px"
                color="#3B6EA0"
                fontWeight="normal"
                _focus={{
                  borderColor: isOverLimit ? '#EF4444' : '#3B6EA0',
                  boxShadow: isOverLimit
                    ? '0 0 0 1px #EF4444'
                    : '0 0 0 1px #3B6EA0',
                  bg: 'white'
                }}
                _placeholder={{
                  color: '#3B6EA0',
                  textAlign: 'center'
                }}
                style={{
                  verticalAlign: 'middle',
                  display: 'inline-block'
                }}
              />
            );
          }
        })}
      </Box>
      {isOverLimit && (
        <Text
          color="red.500"
          fontSize="xs"
          mt={2}
        >
          Превышено количество знаков. Уберите лишние, чтобы отправить.
        </Text>
      )}
    </>
  );
}

export default EditableTextWithVariables;
