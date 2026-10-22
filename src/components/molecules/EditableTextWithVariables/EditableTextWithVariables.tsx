import { Box, Input } from '@chakra-ui/react';
import { useRef } from 'react';

interface EditableTextWithVariablesProps {
  text: string;
  variableValues: Record<string, string>;
  onVariableChange: (variable: string, value: string) => void;
  onTextChange: (text: string) => void;
  placeholder?: string;
  minH?: string;
}

function EditableTextWithVariables({
  text,
  variableValues,
  onVariableChange,
  onTextChange,
  placeholder
}: EditableTextWithVariablesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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
      // Добавляем обычный текст до переменной
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index),
          key: `text-${lastIndex}`
        });
      }
      // Добавляем переменную
      parts.push({
        type: 'variable',
        content: match[1], // имя переменной без {{ }}
        key: `var-${match.index}`
      });
      lastIndex = match.index + match[0].length;
    }

    // Добавляем оставшийся текст
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

  // Обработчик изменения переменной
  const handleVariableInput = (
    variable: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onVariableChange(variable, e.target.value);
  };

  // Обработчик изменения обычного текста (через contenteditable)
  const handleTextBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    const newText = e.target.innerText;
    // Собираем полный текст с переменными
    let fullText = '';
    parts.forEach((part) => {
      if (part.type === 'text') {
        if (part.key === `text-${e.target.dataset.index}`) {
          fullText += newText;
        } else {
          fullText += part.content;
        }
      } else {
        fullText += `{{${part.content}}}`;
      }
    });
    onTextChange(fullText);
  };

  return (
    <Box
      ref={containerRef}
      p={4}
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
    >
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
              style={{
                outline: 'none',
                whiteSpace: 'pre-wrap'
              }}
            >
              {part.content}
            </span>
          );
        } else {
          // Переменная — inline input
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
              borderColor="#3B6EA0"
              borderRadius="6px"
              color="#3B6EA0"
              fontWeight="normal"
              _focus={{
                borderColor: '#3B6EA0',
                boxShadow: '0 0 0 1px #3B6EA0',
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
  );
}

export default EditableTextWithVariables;
