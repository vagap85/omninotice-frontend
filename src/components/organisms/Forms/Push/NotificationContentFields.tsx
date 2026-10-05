import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  HStack,
  Input,
  Text,
  Textarea,
  Icon
} from '@chakra-ui/react';
import { LuSparkles, LuCircleAlert } from 'react-icons/lu';

import { MOCK_TEMPLATES } from '@/mocks/templates';
import TemplateSelector from '@/components/molecules/TemplateSelector/TemplateSelector';
import EditableTextWithVariables from '@/components/molecules/EditableTextWithVariables/EditableTextWithVariables';
import { NotificationTemplate } from '@/types/template';

type VariableValues = Record<string, string>;

export function NotificationContentFields() {
  // Читаем templateId из URL
  const [searchParams] = useSearchParams();
  const initialTemplateId = searchParams.get('templateId') || '';
  const initialTemplate = MOCK_TEMPLATES.find(
    (t) => t.id === initialTemplateId
  );

  // Инициализируем состояние данными из шаблона, если он передан в URL
  const [title, setTitle] = useState(initialTemplate?.title || '');
  const [text, setText] = useState(initialTemplate?.body || '');
  const [buttonText, setButtonText] = useState(
    initialTemplate?.buttonText || ''
  );
  const [buttonLink, setButtonLink] = useState('');
  const [variableValues, setVariableValues] = useState<VariableValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedTemplate, setSelectedTemplate] =
    useState<NotificationTemplate | null>(initialTemplate || null);

  const variables = useMemo(() => {
    const matches = text.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map((m) => m.slice(2, -2)))];
  }, [text]);

  const allVariablesFilled = useMemo(() => {
    return (
      variables.length === 0 ||
      variables.every((v) => variableValues[v]?.trim())
    );
  }, [variables, variableValues]);

  const handleTemplateSelect = (template: NotificationTemplate | null) => {
    setSelectedTemplate(template);

    if (template) {
      setTitle(template.title);
      setText(template.body);
      setButtonText(template.buttonText || '');
      setButtonLink('');
      setVariableValues({});
      setErrors({});
    } else {
      setTitle('');
      setText('');
      setButtonText('');
      setButtonLink('');
      setVariableValues({});
      setErrors({});
    }
  };

  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues((prev) => ({
      ...prev,
      [variable]: value
    }));

    if (errors[variable]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[variable];
        return newErrors;
      });
    }
  };

  const validateVariables = (): boolean => {
    const newErrors: Record<string, string> = {};

    variables.forEach((v) => {
      if (!variableValues[v]?.trim()) {
        newErrors[v] = `Заполните "${v}"`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateVariables()) {
      const firstErrorField = document.querySelector(
        'input[placeholder*="{{"]'
      ) as HTMLElement | null;
      firstErrorField?.focus();
      return;
    }

    console.log('Отправка формы:', {
      title,
      text,
      buttonText,
      buttonLink,
      variables: variableValues
    });
  };

  return (
    <Box
      as="fieldset"
      bg="white"
      borderRadius="10px"
      p={6}
      key={initialTemplateId}
    >
      <Heading
        fontSize="26px"
        lineHeight="32px"
        fontWeight="600"
        color="#12233F"
        mb={4}
      >
        Текст уведомления
      </Heading>

      {/* Select с шаблонами */}
      <TemplateSelector onSelect={handleTemplateSelect} />

      {/* Заголовок уведомления */}
      <Box mt={4}>
        <Text
          fontSize="sm"
          fontWeight="600"
          color="#12233F"
          mb={2}
        >
          Заголовок уведомления
        </Text>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Например, Вам назначена задача"
          bg="#F8FAFC"
          borderRadius="8px"
          borderColor="#E2E8F0"
          _focus={{ borderColor: '#3B6EA0', boxShadow: '0 0 0 1px #3B6EA0' }}
        />
      </Box>

      {/* Текст уведомления */}
      <Box mt={4}>
        <Text
          fontSize="sm"
          fontWeight="600"
          color="#12233F"
          mb={2}
        >
          Текст уведомления
        </Text>

        {selectedTemplate ? (
          <EditableTextWithVariables
            text={text}
            variableValues={variableValues}
            onVariableChange={handleVariableChange}
            onTextChange={setText}
            placeholder="Введите текст уведомления"
          />
        ) : (
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Введите текст уведомления"
            bg="#F8FAFC"
            borderRadius="8px"
            border="1px solid"
            borderColor="#E2E8F0"
            resize="vertical"
            _focus={{
              borderColor: '#3B6EA0',
              boxShadow: '0 0 0 1px #3B6EA0'
            }}
          />
        )}

        {variables.length > 0 && !allVariablesFilled && (
          <HStack
            mt={2}
            color="#EA580C"
            fontSize="xs"
          >
            <Icon
              as={LuCircleAlert}
              boxSize={4}
            />
            <Text>
              В тексте есть переменные вида {`{{  }}`} — замените их на реальные
              значения перед отправкой.
            </Text>
          </HStack>
        )}
      </Box>

      {/* Блок действия */}
      <Box mt={6}>
        <Heading
          fontSize="26px"
          lineHeight="32px"
          fontWeight="600"
          color="#12233F"
          mb={4}
        >
          Действие
        </Heading>

        <Box mt={4}>
          <Text
            fontSize="sm"
            fontWeight="600"
            color="#12233F"
            mb={2}
          >
            Текст кнопки
          </Text>
          <Input
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            placeholder="Ссылка на задачу"
            bg="#F8FAFC"
            borderRadius="8px"
            borderColor="#E2E8F0"
            _focus={{ borderColor: '#3B6EA0', boxShadow: '0 0 0 1px #3B6EA0' }}
          />
        </Box>

        <Box mt={4}>
          <Text
            fontSize="sm"
            fontWeight="600"
            color="#12233F"
            mb={2}
          >
            Ссылка для кнопки
          </Text>
          <Input
            value={buttonLink}
            onChange={(e) => setButtonLink(e.target.value)}
            placeholder="Вставьте ссылку"
            bg="#F8FAFC"
            borderRadius="8px"
            borderColor="#E2E8F0"
            _focus={{ borderColor: '#3B6EA0', boxShadow: '0 0 0 1px #3B6EA0' }}
          />
        </Box>
      </Box>

      <HStack
        justify="flex-end"
        mt={6}
      >
        <Button
          variant="accent"
          leftIcon={<LuSparkles size={20} />}
          color="white"
          borderRadius="12px"
          h={'auto'}
          px={5}
          py={3}
          loadingText="Обработка..."
          lineHeight={'1.5em'}
          disabled
        >
          Улучшить текст
        </Button>

        <Button
          variant="solid"
          colorScheme="blue"
          borderRadius="12px"
          h={'auto'}
          px={5}
          py={3}
          onClick={handleSubmit}
        >
          Создать рассылку
        </Button>
      </HStack>
    </Box>
  );
}

export default NotificationContentFields;
