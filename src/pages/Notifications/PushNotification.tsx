import { Box, Flex } from '@chakra-ui/react';

import { useAuth } from '@/auth/AuthContext';
import { FormProvider } from '@/components/molecules/Form/Providers/FormProvider';
import { FormsRegistryProvider } from '@/components/molecules/Form/Providers/FormsRegistryProvider';
import ActionFields from '@/components/organisms/Forms/Push/ActionFields';
import NotificationContentFields from '@/components/organisms/Forms/Push/NotificationContentFields';
import PushDraftUrlSync from '@/components/organisms/Forms/Push/PushDraftUrlSync';
import SelectingRecipientApp from '@/components/organisms/Forms/Push/SelectingRecipientApp/SelectingRecipientApp';

import PageHeader from '../../components/molecules/PageHeader/PageHeader';

export default function PushNotification() {
  const { isAuthorized } = useAuth();

  return (
    <FormsRegistryProvider>
      <PushCreateNotificatonInner isAuthorized={isAuthorized} />
    </FormsRegistryProvider>
  );
}

function PushCreateNotificatonInner({ isAuthorized }: { isAuthorized: boolean }) {
  return (
    <FormProvider formId="pushNotification">
      <PushDraftUrlSync />
      <Flex>
        <Box flex="1" bg="#ECF2F8">
          <PageHeader
            isAuthorized={isAuthorized}
            title="Создание рассылки push-уведомлений"
          />
          <Flex
            flexDirection={{
              md: "row",
              base: "column"
            }}
          >
            <Flex
              as="form"
              direction="column"
              gap={5}
              flex="1"
              p={"clamp(12px, 1.7vw + 0.125rem, 24px)"}
            >
              <NotificationContentFields />
              <ActionFields />
            </Flex>
            <SelectingRecipientApp isAuthorized={isAuthorized} />
          </Flex>
        </Box>
      </Flex>
    </FormProvider>
  );
}