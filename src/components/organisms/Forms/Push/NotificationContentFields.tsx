import { Box, Heading, HStack, Icon, Text } from '@chakra-ui/react';
import { useState, useMemo, useEffect, useContext } from 'react';
import { LuCircleAlert } from 'react-icons/lu';
import { useSearchParams } from 'react-router-dom';

import EditableTextWithVariables from '@/components/molecules/EditableTextWithVariables/EditableTextWithVariables';
import ImproveTextButton from '@/components/molecules/ImproveTextButton/ImproveTextButton';
import { FormTextAreaField } from '@/components/molecules/Form/Elements/FormTextAreaField';
import { FormTextField } from '@/components/molecules/Form/Elements/FormTextField';
import { FormsRegistryContext } from '@/components/molecules/Form/FormContext';
import {
  required,
  maxLength
} from '@/components/molecules/Form/validators/validators';
import TemplateSelector from '@/components/molecules/TemplateSelector/TemplateSelector';
import { MOCK_TEMPLATES } from '@/mocks/templates';
import { NotificationTemplate } from '@/types/template';

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

  const registryContext = useContext(FormsRegistryContext);
  const store = registryContext
    ? registryContext.getOrCreateStore(formId)
    : null;

  const [title, setTitle] = useState(initialTemplate?.title || '');
  const [text, setText] = useState(initialTemplate?.body || '');
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {}
  );
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

  const isContentValid =
    title.trim().length > 0 && text.trim().length > 0 && allVariablesFilled;

  useEffect(() => {
    if (store) {
      store.setValue('title', title);
      store.setValue('text', text);
      store.setValue('variableValues', variableValues);
      store.setValue('_isContentValid', isContentValid);
    }
  }, [title, text, variableValues, isContentValid, store]);

  const handleTemplateSelect = (template: NotificationTemplate | null) => {
    setSelectedTemplate(template);
    if (template) {
      setTitle(template.title);
      setText(template.body);
      setVariableValues({});
    } else {
      setTitle('');
      setText('');
      setVariableValues({});
    }
  };

  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [variable]: value }));
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

      <Box data-tour="template-selector">
        <TemplateSelector onSelect={handleTemplateSelect} />
      </Box>

      <Box mt={4}>
        <FormTextField
          name="title"
          label="Заголовок уведомления"
          placeholder="Например, Вам назначена задача"
          subTitlte="Отображается первой строкой в ленте уведомлений более крупно и заметно"
          validators={[required()]}
          initialValue={title}
          maxLength={50}
        />
      </Box>

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
              onTextChange={setText}

              placeholder="Введите текст уведомления"
            />
          </>
        ) : (
          <FormTextAreaField
            name="text"
            label="Текст уведомления"
            placeholder="Введите текст уведомления"
            minH="155px"
            maxLength={200}
            validators={[required(), maxLength(200)]}
            initialValue={text}
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
              В тексте есть переменные вида {'{{ }}'} — замените их на реальные
              значения перед отправкой.
            </Text>
          </HStack>
        )}
      </Box>

      <HStack
        justify="flex-end"
        mt={6}
      >
        <ImproveTextButton isDisabled />
      </HStack>
    </Box>
  );
}

export default NotificationContentFields;
