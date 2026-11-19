import { Box, Flex, Heading, useToast, VStack } from '@chakra-ui/react';
import { useState } from 'react';

import { improveText } from '@/api/improveText';
import ImproveTextButton from '@/components/molecules/ImproveTextButton/ImproveTextButton';
import { FormTextAreaField } from '@/components/molecules/Form/Elements/FormTextAreaField';
import { FormTextField } from '@/components/molecules/Form/Elements/FormTextField';
import { useFormStore } from '@/components/molecules/Form/hooks/useFormStore';
import ImproveTextModal from '@/components/organisms/Modals/ImproveTextModal';
import { EmailFormValues } from '@/pages/types/types';
import { httpUrl } from '@/components/molecules/Form/validators/validators';

import { EmailMainFieldsProps } from '../../types/types';

type TextVariant = {
  id: number;
  title: string;
  preheader: string;
  body: string;
};

export default function EmailMainFields({
  canImprove,
  initialValues = {}
}: EmailMainFieldsProps) {
  const formStore = useFormStore();
  const toast = useToast();
  const [isImproving, setIsImproving] = useState(false);
  const [variants, setVariants] = useState<{
    first: TextVariant;
    second: TextVariant;
  } | null>(null);

  const handleImproveText = async () => {
    const { messageTitle, preheader, body } =
      formStore.getValues<EmailFormValues>();
    const text = [messageTitle, preheader, body]
      .filter((value) => value?.trim())
      .join('\n\n');

    if (!text) {
      toast({
        title: 'Нет текста для улучшения',
        description: 'Сначала заполните заголовок или текст письма.',
        status: 'warning',
        duration: 4000,
        isClosable: true
      });
      return;
    }

    setIsImproving(true);
    try {
      const response = await improveText(text);
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
    formStore.setValue('messageTitle', variant.title);
    formStore.setValue('preheader', variant.preheader);
    formStore.setValue('body', variant.body);
    setVariants(null);
  };

  return (
    <>
      {variants && (
        <ImproveTextModal
          isOpen
          onClose={() => setVariants(null)}
          firstVariant={variants.first}
          secondVariant={variants.second}
          onApply={handleApplyVariant}
        />
      )}
      <Box
        as="fieldset"
        bg="white"
        borderRadius="10px"
        p={6}
        mt={5}
      >
        <Heading
          size="md"
          mb={4}
        >
          Текст письма
        </Heading>
        <VStack
          align="stretch"
          spacing={5}
        >
          <FormTextField
            name="messageTitle"
            label="Заголовок письма"
            placeholder="Добрый день! Подготовили для вас специальное предложение"
            subTitlte="Начало текста письма, будет отображаться более крупно и заметно"
            initialValue={initialValues.messageTitle}
          />

          <FormTextAreaField
            name="body"
            label="Основная часть письма"
            placeholder="Введите текст рассылки"
            minH="160px"
            initialValue={initialValues.body}
          />

          <FormTextAreaField
            name="signature"
            label="Подпись"
            placeholder="Здесь можно указать название компании и контакты для обратной связи"
            minH="100px"
            initialValue={initialValues.signature}
          />

          <Flex justify="flex-end">
            <ImproveTextButton
              onClick={handleImproveText}
              isDisabled={!canImprove}
              isLoading={isImproving}
            />
          </Flex>
        </VStack>
      </Box>

      <Box
        as="fieldset"
        bg="white"
        borderRadius="10px"
        p={6}
        maxW="900px"
        mx="auto"
        mt={4}
      >
        <Heading
          size="md"
          mb={4}
        >
          Действие
        </Heading>
        <VStack
          align="stretch"
          spacing={5}
        >
          <FormTextField
            name="actionText"
            label="Текст кнопки"
            placeholder="Например, перейти на сайт"
            maxLength={18}
            initialValue={initialValues.actionText}
          />
          <FormTextField
            name="actionLink"
            label="Ссылка для кнопки"
            placeholder="Вставьте ссылку"
            initialValue={initialValues.actionLink}
            validators={[
              httpUrl(
                'Проверьте ссылку и укажите валидный URL в формате http(s)://...'
              )
            ]}
          />
        </VStack>
      </Box>
    </>
  );
}
