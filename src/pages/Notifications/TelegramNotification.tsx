import { Box } from '@chakra-ui/react';

import { FormProvider } from '@/components/molecules/Form/Providers/FormProvider';
import SelectingBot from '@/components/organisms/Forms/Telegram/SelectingBot/SelectingBot';
import TelegramMainFields from '@/components/organisms/Forms/Telegram/TelegramMainFields';
import NotificationLayout from '@/components/layouts/NotificationLayout';
import { FormsRegistryProvider } from '@/components/molecules/Form/Providers/FormsRegistryProvider';
import { TelegramContentFields } from '@/components/organisms/Forms/Telegram/TelegramContentFields';
import TelegramActionFields from '@/components/organisms/Forms/Telegram/TelegramActionFields';

export default function TelegramNotification() {
  return (
    <FormsRegistryProvider>
      <FormProvider formId="telegramNotification">
        <NotificationLayout sidebar={<SelectingBot />}>
          <Box
            as="form"
            display={"flex"}
            flexDirection={"column"}
            gap={4}
            w="full"
            p="clamp(12px, 1.7vw + 0.125rem, 24px)"
            maxW="900px"
            mx="auto"
          >
            <TelegramMainFields />
            <TelegramContentFields />
            <TelegramActionFields />
          </Box>
        </NotificationLayout>
      </FormProvider>
    </FormsRegistryProvider>
  );
}
