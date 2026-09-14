import { useEffect } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

import PageHeader from '../../components/molecules/PageHeader/PageHeader';
import PushDraftUrlSync from '@/components/organisms/Forms/Push/PushDraftUrlSync';
import { FormProvider, FormsRegistryProvider } from '@/components/molecules/Form/FormContext';
import ActionSectTest from '@/components/organisms/Forms/Push/ActionSectTest';
import NotifContSectTest from '@/components/organisms/Forms/Push/NotifContSectTest';
import SelectingRecipientAppTest from '@/components/organisms/SelectingRecipientApp-v2/SelectingRecipientAppTest';
import { useAuth } from '@/auth/AuthContext';

export default function PushNotification() {
  const navigate = useNavigate();
  const { isAuthorized } = useAuth();

  useEffect(() => {
    if (!isAuthorized) {
      navigate("/login");
    }
  }, [isAuthorized, navigate]);

  if (!isAuthorized) {
    const authBg = "../assets/image 1.jpg"
    return (
      <Box
        aria-hidden
        position="absolute"
        inset={0}
        zIndex={0}
        bgImage={`url("${authBg}")`}
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
        minW="100%"
        minH="100%"
      />
    );
  }

  return (
    <FormsRegistryProvider>
      <PushCreateNotificatonInner isAuthorized={isAuthorized} />
    </FormsRegistryProvider>
  );
}

function PushCreateNotificatonInner({ isAuthorized }: { isAuthorized: boolean }) {
  return (
    <FormProvider formId="pushNotification">
      <PushDraftUrlSync /> {/* лист, ничего не рендерит, лежит рядом с деревом, а не над ним */}
      <Flex>
        <Box flex="1" bg="#ECF2F8">
          <PageHeader
            isAuthorized={isAuthorized}
            title="Создание рассылки push-уведомлений"
          />
          <Flex>
            <Flex as="form" direction="column" gap={5} flex="1" padding={6}>
              <NotifContSectTest />
              <ActionSectTest />
            </Flex>
            <SelectingRecipientAppTest isAuthorized={isAuthorized} />
          </Flex>
        </Box>
      </Flex>
    </FormProvider>
  );
}