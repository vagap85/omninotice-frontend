import { Box, Flex, Heading, useToast } from '@chakra-ui/react';
import type { JSONContent } from '@tiptap/core';
import { useState } from 'react';

import { improveText } from '@/api/improveText';
import { useFormStore } from '@/components/molecules/Form/hooks/useFormStore';
import { getTelegramMessageText } from '@/components/molecules/helpers/telegramMessageFormat';
import ImproveTextButton from '@/components/molecules/ImproveTextButton/ImproveTextButton';
import TelegramMessageEditor from '@/components/molecules/TelegramMessageEditor/TelegramMessageEditor';
import ImproveTextModal from '@/components/organisms/Modals/ImproveTextModal';

type TextVariant = {
  id: number;
  title: string;
  preheader: string;
  body: string;
};

export const TelegramContentFields = () => {
  const formStore = useFormStore();
  const toast = useToast();
  const [isImproving, setIsImproving] = useState(false);
  const [variants, setVariants] = useState<{
    first: TextVariant;
    second: TextVariant;
  } | null>(null);

  const handleImproveText = async () => {
    const message = formStore.getValues<{ message?: JSONContent }>().message;
    const text = message ? getTelegramMessageText(message) : '';

    if (!text.trim()) {
      toast({
        title: 'Нет текста для улучшения',
        description: 'Сначала заполните текст сообщения.',
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
    const content: JSONContent = {
      type: 'doc',
      content: variant.body.split('\n').map((line) => ({
        type: 'paragraph',
        content: line ? [{ type: 'text', text: line }] : []
      }))
    };
    formStore.setValue('message', content);
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
          heading="Варианты улучшения сообщения"
          fields={[{ key: 'body', label: 'Текст сообщения' }]}
        />
      )}
      <Heading
        fontSize="26px"
        lineHeight="32px"
        fontWeight="600"
        color="#12233F"
        mb={4}
      >
        Содержимое сообщения
      </Heading>
      <TelegramMessageEditor
        name="message"
        label="Текст сообщения"
        placeholder="Введите текст сообщения"
      />
      <Flex
        justify="flex-end"
        mt={3}
      >
        <ImproveTextButton
          onClick={handleImproveText}
          isLoading={isImproving}
        />
      </Flex>
    </Box>
  );
};
