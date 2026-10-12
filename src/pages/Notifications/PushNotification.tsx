import { Box, Button, Flex, Portal } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAuth } from '@/auth/AuthContext';
import { FormProvider } from '@/components/molecules/Form/Providers/FormProvider';
import { FormsRegistryProvider } from '@/components/molecules/Form/Providers/FormsRegistryProvider';
import ActionFields from '@/components/organisms/Forms/Push/ActionFields';
import NotificationContentFields from '@/components/organisms/Forms/Push/NotificationContentFields';
import PushDraftUrlSync from '@/components/organisms/Forms/Push/PushDraftUrlSync';
import SelectingRecipientApp from '@/components/organisms/Forms/Push/SelectingRecipientApp/SelectingRecipientApp';
import { OnboardingTour } from '@/components/molecules/OnboardingTour/OnboaringTour';

const STORAGE_KEY_TOUR_COMPLETED = 'onboarding_tour_completed';
const STORAGE_KEY_REAL_SEND = 'onboarding_real_send';
const STORAGE_KEY_FIRST_VISIT = 'onboarding_first_visit';

export default function PushNotification() {
  const { isAuthorized } = useAuth();

  return (
    <FormsRegistryProvider>
      <PushCreateNotificatonInner isAuthorized={isAuthorized} />
    </FormsRegistryProvider>
  );
}

function PushCreateNotificatonInner({
  isAuthorized
}: {
  isAuthorized: boolean;
}) {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('templateId') || '';

  const [isTourOpen, setIsTourOpen] = useState(() => {
    const firstVisit = localStorage.getItem(STORAGE_KEY_FIRST_VISIT);
    const tourCompleted = localStorage.getItem(STORAGE_KEY_TOUR_COMPLETED);
    return firstVisit === null && tourCompleted !== 'true';
  });

  const [isHintButtonVisible, setIsHintButtonVisible] = useState(() => {
    const tourCompleted = localStorage.getItem(STORAGE_KEY_TOUR_COMPLETED);
    const realSend = localStorage.getItem(STORAGE_KEY_REAL_SEND);
    return tourCompleted !== 'true' || realSend !== 'true';
  });

  useEffect(() => {
    const firstVisit = localStorage.getItem(STORAGE_KEY_FIRST_VISIT);
    const tourCompleted = localStorage.getItem(STORAGE_KEY_TOUR_COMPLETED);

    if (firstVisit === null && tourCompleted !== 'true') {
      localStorage.setItem(STORAGE_KEY_FIRST_VISIT, 'true');
    }
  }, []);

  const handleCompleteTour = () => {
    localStorage.setItem(STORAGE_KEY_TOUR_COMPLETED, 'true');
    setIsTourOpen(false);
    setIsHintButtonVisible(false);
  };

  const handleShowTour = () => {
    setIsTourOpen(true);
  };

  return (
    <FormProvider formId="pushNotification">
      <PushDraftUrlSync />
      <Flex>
        <Box
          flex="1"
          bg="#ECF2F8"
        >
          <Flex
            flexDirection={{ md: 'row', base: 'column' }}
            justifyContent={'space-between'}
          >
            <Flex
              as="form"
              direction="column"
              gap={5}
              flex="1"
              p={'clamp(12px, 1.7vw + 0.125rem, 24px)'}
              maxW={'900px'}
              mx={'auto'}
            >
              <Box data-tour="notification-text">
                <NotificationContentFields
                  key={templateId}
                  formId="pushNotification"
                />
              </Box>

              <Box data-tour="action-block">
                <ActionFields />
              </Box>
            </Flex>

            <Box data-tour="settings-panel">
              <SelectingRecipientApp isAuthorized={isAuthorized} />
            </Box>
          </Flex>
        </Box>
      </Flex>

      {isHintButtonVisible && !isTourOpen && (
        <Portal>
          <Button
            position="fixed"
            bottom="71px"
            left="96px"
            bg="#3B6EA0"
            color="white"
            borderRadius="xl"
            px="10px"
            py="8px"
            fontSize="sm"
            fontWeight="500"
            _hover={{ bg: '#2f5a85' }}
            onClick={handleShowTour}
            zIndex={100}
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
          >
            Показать подсказки по сервису
          </Button>
        </Portal>
      )}

      <OnboardingTour
        isOpen={isTourOpen}
        onComplete={handleCompleteTour}
      />
    </FormProvider>
  );
}
