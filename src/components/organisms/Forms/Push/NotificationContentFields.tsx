import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Spinner,
  Text,
  useToast
} from '@chakra-ui/react';
import { useState, useMemo, useEffect, useContext } from 'react';
import { LuCircleAlert } from 'react-icons/lu';
import { ErrorBoundary } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/auth/AuthContext';
import { improveText } from '@/api/improveText';
import EditableTextWithVariables from '@/components/molecules/EditableTextWithVariables/EditableTextWithVariables';
import ImproveTextButton from '@/components/molecules/ImproveTextButton/ImproveTextButton';
import { FormTextAreaField } from '@/components/molecules/Form/Elements/FormTextAreaField';
import { FormTextField } from '@/components/molecules/Form/Elements/FormTextField';
import { FormsRegistryContext } from '@/components/molecules/Form/FormContext';
import ImproveTextModal from '@/components/organisms/Modals/ImproveTextModal';
import {
  maxLength,
  required
} from '@/components/molecules/Form/validators/validators';
import TemplateSelector from '@/components/molecules/TemplateSelector/TemplateSelector';
import { NotificationTemplate } from '@/types/template';
import { ROUTES } from '@/routing/routes';

interface NotificationContentFieldsProps {
  formId: string;
  initialData?: NotificationTemplate | null;
  templates: NotificationTemplate[];
  templatesLoading?: boolean;
  templatesError?: boolean;
}

type TextVariant = {
  id: number;
  title: string;
  preheader: string;
  body: string;
};

export function NotificationContentFields({
  formId,
  initialData,
  templates,
  templatesLoading = false,
  templatesError = false
}: NotificationContentFieldsProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const registryContext = useContext(FormsRegistryContext);
  const store = registryContext
    ? registryContext.getOrCreateStore(formId)
    : null;

  const [title, setTitle] = useState(initialData?.title || '');
  const [text, setText] = useState(initialData?.body || '');
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {}
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<NotificationTemplate | null>(initialData || null);
  const toast = useToast();
  const [isImproving, setIsImproving] = useState(false);
  const [variants, setVariants] = useState<{
    first: TextVariant;
    second: TextVariant;
  } | null>(null);

  // Автоматически вытаскиваем переменные из текста (например, {{имя}})
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

  // Синхронизация значений с глобальным стором формы
  useEffect(() => {
    if (store) {
      store.setValue('title', title);
      store.setValue('text', text);
      store.setValue('variableValues', variableValues);
    }
  }, [title, text, variableValues, store]);

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

  const handleImproveText = async () => {
    const currentValues = store?.getValues<{ title?: string; text?: string }>();
    const currentTitle = currentValues?.title ?? title;
    const currentText = currentValues?.text ?? text;
    const textToImprove = [currentTitle, currentText]
      .filter((value) => value?.trim())
      .join('\n\n');

    if (!textToImprove) {
      toast({
        title: 'Нет текста для улучшения',
        description: 'Сначала заполните заголовок или текст уведомления.',
        status: 'warning',
        duration: 4000,
        isClosable: true
      });
      return;
    }

    setIsImproving(true);
    try {
      const response = await improveText(textToImprove);
      setVariants({
        first: {
          id: 1,
          title: response.answerFirst.title,
          preheader: response.answerFirst.description,
          body: response.answerFirst.text
        },
        second: {
          id: 2,
          title: response.answerSecond.title,
          preheader: response.answerSecond.description,
          body: response.answerSecond.text
        }
      });
    } catch (error) {
      toast({
        title: 'Не удалось улучшить текст',
        description:
          error instanceof Error
            ? error.message
            : 'Произошла неизвестная ошибка.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsImproving(false);
    }
  };

  const handleApplyVariant = (variant: TextVariant) => {
    setTitle(variant.title);
    setText(variant.body);
    setVariableValues({});
    store?.setValue('title', variant.title);
    store?.setValue('text', variant.body);
    store?.setValue('variableValues', {});
    setVariants(null);
  };

  return (
    <Box
      as="fieldset"
      bg="white"
      borderRadius="10px"
      p={6}
    >
      {variants && (
        <ImproveTextModal
          isOpen
          onClose={() => setVariants(null)}
          firstVariant={variants.first}
          secondVariant={variants.second}
          onApply={handleApplyVariant}
          heading="Варианты улучшения уведомления"
          fields={[
            { key: 'title', label: 'Заголовок уведомления' },
            { key: 'body', label: 'Текст уведомления' }
          ]}
        />
      )}
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
        {templatesError ? (
          <TemplateSelectorError
            onLogin={() => {
              logout();
              navigate(ROUTES.login);
            }}
          />
        ) : templatesLoading ? (
          <Flex
            align="center"
            gap={2}
            py={2}
          >
            <Spinner
              color="#346895"
              size="sm"
            />
            <Text
              color="#64748B"
              fontSize="sm"
            >
              Загружаем шаблоны…
            </Text>
          </Flex>
        ) : (
          <ErrorBoundary
            FallbackComponent={() => (
              <TemplateSelectorError
                onLogin={() => {
                  logout();
                  navigate(ROUTES.login);
                }}
              />
            )}
            onError={(error, info) =>
              console.error('Ошибка отображения шаблонов:', error, info)
            }
          >
            <TemplateSelector
              onSelect={handleTemplateSelect}
              selectedTemplate={selectedTemplate}
              templates={templates}
            />
          </ErrorBoundary>
        )}
      </Box>

      <Box mt={4}>
        <FormTextField
          name="title"
          label="Заголовок уведомления"
          placeholder="Например, Вам назначена задача"
          subTitlte="Отображается первой строкой в ленте уведомлений более крупно и заметно"
          validators={[required(), maxLength(50)]}
          initialValue={title}
          maxLength={50}
          softMaxLength
          maxLengthMessage="Превышен лимит символов"
          pr={'4rem'}
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
              onTextChange={(nextText) => {
                setText(nextText);
                store?.setValue('text', nextText);
              }}
              onTextInput={(nextText) => store?.setValue('text', nextText)}
              placeholder="Введите текст уведомления"
              maxLength={200}
            />
          </>
        ) : (
          <FormTextAreaField
            name="text"
            label="Текст уведомления"
            placeholder="Введите текст уведомления"
            minH="155px"
            maxLength={200}
            softMaxLength
            maxLengthMessage="Превышен лимит символов"
            validators={[required(), maxLength(200)]}
            initialValue={text}
          />
        )}

        {/* Предупреждение о незаполненных переменных */}
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
        <ImproveTextButton
          onClick={handleImproveText}
          isLoading={isImproving}
        />
      </HStack>
    </Box>
  );
}

function TemplateSelectorError({ onLogin }: { onLogin: () => void }) {
  return (
    <Flex
      align="center"
      gap={2}
      p={3}
      bg="#FEF2F2"
      borderRadius="md"
    >
      <Icon
        as={LuCircleAlert}
        boxSize={6}
        color="#EF4444"
        flexShrink={0}
      />
      <Flex
        align="center"
        flexWrap="wrap"
        gap={2}
      >
        <Text color="#12233F">
          Не удалось загрузить шаблоны. Пожалуйста, войдите в аккаунт повторно.
        </Text>
        <Button
          variant="ghost"
          color="#3B6EA0"
          onClick={onLogin}
          minH="unset"
          h="unset"
          p={0}
          _hover={{ bg: 'transparent' }}
        >
          Перезайти
        </Button>
      </Flex>
    </Flex>
  );
}

export default NotificationContentFields;
