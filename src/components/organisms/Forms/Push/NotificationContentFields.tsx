import {
  useState,
  useMemo,
  useCallback,
  useSyncExternalStore,
  memo
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Button, Heading, HStack, Icon, Text } from '@chakra-ui/react';
import { LuSparkles, LuCircleAlert } from 'react-icons/lu';

import { FormTextAreaField } from '@/components/molecules/Form/Elements/FormTextAreaField';
import { FormTextField } from '@/components/molecules/Form/Elements/FormTextField';
import {
  required,
  maxLength
} from '@/components/molecules/Form/validators/validators';
import { MOCK_TEMPLATES } from '@/mocks/templates';
import TemplateSelector from '@/components/molecules/TemplateSelector/TemplateSelector';
import EditableTextWithVariables from '@/components/molecules/EditableTextWithVariables/EditableTextWithVariables';
import { NotificationTemplate } from '@/types/template';
import { useFormStore } from '@/components/molecules/Form/hooks/useFormStore';

type VariableValues = Record<string, string>;

interface NotificationContentFieldsProps {
  formId: string;
}

export function NotificationContentFields({
  formId
}: NotificationContentFieldsProps) {
  const [searchParams] = useSearchParams();
  const initialTemplateId = searchParams.get('templateId') || '';
  const initialTemplate = MOCK_TEMPLATES.find(
    (t) => t.id === initialTemplateId
  );

  const store = useFormStore(formId);

  const text = useSyncExternalStore(
    useCallback((cb) => store.subscribe('text', cb), [store]),
    useCallback(
      () => (store.getSnapshot('text')?.value as string | undefined) ?? '',
      [store]
    )
  );

  const [selectedTemplate, setSelectedTemplate] =
    useState<NotificationTemplate | null>(initialTemplate || null);

  const [variableValues, setVariableValues] = useState<VariableValues>({});

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

  const handleTemplateSelect = useCallback(
    (template: NotificationTemplate | null) => {
      setSelectedTemplate(template);
      store.setValue('title', template?.title ?? '');
      store.setValue('text', template?.body ?? '');
      setVariableValues({});
    },
    [store]
  );

  const handleTextChange = useCallback(
    (newText: string) => {
      store.setValue('text', newText);
    },
    [store]
  );

  const handleVariableChange = useCallback(
    (variable: string, value: string) => {
      setVariableValues((prev) => ({ ...prev, [variable]: value }));
    },
    []
  );

  return (
    <Box
      as="fieldset"
      bg="white"
      borderRadius="10px"
      p={6}
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
        <FormTextField
          name="title"
          label="Заголовок уведомления"
          placeholder="Например, Вам назначена задача"
          subTitlte="Отображается первой строкой в ленте уведомлений более крупно и заметно"
          validators={[required()]}
          initialValue={initialTemplate?.title ?? ''}
        />
      </Box>

      {/* Текст уведомления */}
      <Box mt={4}>
        {selectedTemplate ? (
          <>
            <Text
              fontSize="sm"
              fontWeight="600"
              color="#12233F"
              mb={2}
            >
              Текст уведомления
            </Text>
            <EditableTextWithVariables
              text={text}
              variableValues={variableValues}
              onVariableChange={handleVariableChange}
              onTextChange={handleTextChange}
              placeholder="Введите текст уведомления"
            />
          </>
        ) : (
          <FormTextAreaField
            name="text"
            label="Текст уведомления"
            placeholder="Введите текст уведомления"
            minH="155px"
            maxLength={155}
            validators={[required(), maxLength(155)]}
            initialValue={initialTemplate?.body ?? ''}
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
      </HStack>
    </Box>
  );
}

export default memo(NotificationContentFields);
