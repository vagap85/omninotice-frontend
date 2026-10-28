import { Box, Input } from '@chakra-ui/react';
import { useRef } from 'react';

interface EditableTextWithVariablesProps {
  text: string;
  variableValues: Record<string, string>;
  onVariableChange: (variable: string, value: string) => void;
  onTextChange: (text: string) => void;
  placeholder?: string;
  minH?: string;
  maxLength?: number;
}

function EditableTextWithVariables({
  text,
  variableValues,
  onVariableChange,
  onTextChange,
  placeholder,
  maxLength = 200
}: EditableTextWithVariablesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Подсчет длины текста С УЧЕТОМ значений переменных
  const currentLength = text.replace(
    /\{\{([^}]+)\}\}/g,
    (_match, variableName) => {
      const value = variableValues[variableName] || '';
      return value;
    }
  ).length;

  const isOverLimit = currentLength > maxLength;

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

  // Обработчик изменения переменной
  const handleVariableInput = (
    variable: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.value;
    const currentValue = variableValues[variable] || '';

    const newLength = currentLength - currentValue.length + newValue.length;

    if (newLength <= maxLength) {
      onVariableChange(variable, newValue);
    }
  };

  // Обработчик изменения обычного текста
  const handleTextBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    const newText = e.target.innerText;
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

    const finalLength = fullText.replace(
      /\{\{([^}]+)\}\}/g,
      (_match, variableName) => {
        const value = variableValues[variableName] || '';
        return value;
      }
    ).length;

    if (finalLength <= maxLength) {
      onTextChange(fullText);
    } else {
      e.target.innerText = text;
    }
  };

  // Предотвращаем ввод, если превышен лимит
  const handleTextInput = (e: React.FormEvent<HTMLSpanElement>) => {
    const target = e.target as HTMLSpanElement;
    const newText = target.innerText;

    let fullText = '';
    parts.forEach((part) => {
      if (part.type === 'text') {
        if (part.key === `text-${target.dataset.index}`) {
          fullText += newText;
        } else {
          fullText += part.content;
        }
      } else {
        fullText += `{{${part.content}}}`;
      }
    });

    const newLength = fullText.replace(
      /\{\{([^}]+)\}\}/g,
      (_match, variableName) => {
        const value = variableValues[variableName] || '';
        return value;
      }
    ).length;

    if (newLength > maxLength) {
      e.preventDefault();
      return false;
    }
  };

  return (
    <Box
      ref={containerRef}
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
      borderColor={isOverLimit ? 'red.300' : '#E2E8F0'}
      minH="155px"
    >
      <Box
        position="absolute"
        top="10px"
        right="11px"
        fontSize="md"
        color="#A1A1AA"
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
  );
}

export default EditableTextWithVariables;
