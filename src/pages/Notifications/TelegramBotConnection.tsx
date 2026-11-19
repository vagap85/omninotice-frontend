import { Box, Button, Flex, Link, Text } from '@chakra-ui/react';

import NotificationLayout from '@/components/layouts/NotificationLayout';
import RightSidebar from '@/components/molecules/RightSidebar/RightSidebar';
import TelegramConnectionMainFields from '@/components/organisms/Forms/Telegram/Connection/TelegramConnectionMainFields';
import { FormsRegistryProvider } from '@/components/molecules/Form/Providers/FormsRegistryProvider';
import { FormProvider } from '@/components/molecules/Form/Providers/FormProvider';
import TelegramTokenField from '@/components/organisms/Forms/Telegram/Connection/TelegramTokenField';
import { FormSubmitButton } from '@/components/molecules/Form/Elements/FormSubmitButton';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routing/routes';

const CONNECTION_STEPS = [
  {
    id: 'open-botfather',
    title: (
      <>
        Откройте чат с{' '}
        <Link
          href="https://t.me/BotFather"
          isExternal
          color="#2563EB"
          textDecoration="underline"
        >
          @BotFather
        </Link>{' '}
        в Telegram
      </>
    ),
    description: 'Служебный бот, через который создаются все остальные'
  },
  {
    id: 'create-bot',
    title: 'Создайте нового бота',
    description: (
      <>
        Отправьте команду{' '}
        <Text
          as="span"
          color="#2563EB"
          textDecoration="underline"
        >
          /newbot
        </Text>{' '}
        в чат @botfather и следуйте инструкциям
      </>
    )
  },
  {
    id: 'copy-token',
    title: 'Скопируйте токен',
    description:
      'Через пару шагов @botfather отправит вам токен для нового бота. Пожалуйста, вставьте его в поле «Токен»'
  }
];

export default function TelegramBotConnection() {
  const navigate = useNavigate();
  return (
    <NotificationLayout
      sidebar={
        <RightSidebar title="Как получить и подключить токен">
          <Flex
            direction="column"
            gap={3}
          >
            {CONNECTION_STEPS.map((step, index) => (
              <Flex
                key={step.id}
                align="flex-start"
                gap={3}
              >
                <Box
                  flexShrink={0}
                  display="grid"
                  placeItems="center"
                  boxSize={6}
                  borderRadius="full"
                  bg="#3B6EA0"
                  color="white"
                  fontSize="xs"
                  fontWeight="600"
                >
                  {index + 1}
                </Box>
                <Box>
                  <Text
                    color="brand.800"
                    fontSize="md"
                    fontWeight="600"
                    lineHeight={6}
                  >
                    {step.title}
                  </Text>
                  <Text
                    mt={1}
                    color="#A1A1AA"
                    fontSize="md"
                    lineHeight={6}
                  >
                    {step.description}
                  </Text>
                </Box>
              </Flex>
            ))}
          </Flex>
        </RightSidebar>
      }
    >
      <FormsRegistryProvider>
        <FormProvider formId="bot-connection">
          <Box
            as="form"
            display={'flex'}
            flexDirection={'column'}
            gap={4}
            w="full"
            p="clamp(12px, 1.7vw + 0.125rem, 24px)"
            maxW="900px"
            mx="auto"
          >
            <TelegramConnectionMainFields />
            <TelegramTokenField />
            <Flex
              width={'full'}
              justifyContent={'flex-end'}
              gap={3}
            >
              <Button
                variant={'outline'}
                h={'unset'}
                onClick={() => navigate(ROUTES.createTelegram)}
              >
                Отмена
              </Button>
              <FormSubmitButton
                formIds={['bot-connection']}
                onSubmit={() => {}}
                rightIcon={
                  <ArrowForwardIcon
                    w={5}
                    h={5}
                  />
                }
                px={5}
                py={3}
                h={'unset'}
              >
                Подключить
              </FormSubmitButton>
            </Flex>
          </Box>
        </FormProvider>
      </FormsRegistryProvider>
    </NotificationLayout>
  );
}
