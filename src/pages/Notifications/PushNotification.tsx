import {
  Box,
  Flex,
  Portal,
  Icon,
  Text,
  Spinner,
  Center
} from '@chakra-ui/react';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { NotificationProvider } from 'omni-notice-sigma-notification-widget';
import 'omni-notice-sigma-notification-widget/style.css';
import { LuLightbulb } from 'react-icons/lu';

import { useAuth } from '@/auth/AuthContext';
import NotificationLayout from '@/components/layouts/NotificationLayout';
import { FormProvider } from '@/components/molecules/Form/Providers/FormProvider';
import { FormsRegistryProvider } from '@/components/molecules/Form/Providers/FormsRegistryProvider';
import { OnboardingTour } from '@/components/molecules/OnboardingTour/OnboaringTour';
import { IncludeServices } from '@/components/molecules/IncludeServices/IncludeServices';
import ActionFields from '@/components/organisms/Forms/Push/ActionFields';
import NotificationContentFields from '@/components/organisms/Forms/Push/NotificationContentFields';
import { PushNotificationProvider } from '@/components/organisms/Forms/Push/Providers/PushNotificationProvider';
import SelectingRecipientApp from '@/components/organisms/Forms/Push/SelectingRecipientApp/SelectingRecipientApp';
import '@/lib/notification-widget/notification-widget.css';

import { getTemplates } from '@/api/vishenka';
import { NotificationTemplate } from '@/types/template';

const STORAGE_KEY_TOUR_COMPLETED = 'onboarding_tour_completed';
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
  const [tourSession, setTourSession] = useState(0);
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('templateId') || '';

  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);

  const [isFetchingTemplates, setIsFetchingTemplates] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    getTemplates()
      .then((data) => {
        if (isMounted) setTemplates(data);
      })
      .catch((err) => {
        console.error('Не удалось загрузить шаблоны:', err);
      })
      .finally(() => {
        if (isMounted) setIsFetchingTemplates(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Ищем нужный шаблон для автозаполнения
  const templateData = useMemo(() => {
    if (!templateId) return null;
    return templates.find((t) => t.id === templateId) || null;
  }, [templates, templateId]);

  const [isTourOpen, setIsTourOpen] = useState(() => {
    const firstVisit = localStorage.getItem(STORAGE_KEY_FIRST_VISIT);
    const tourCompleted = localStorage.getItem(STORAGE_KEY_TOUR_COMPLETED);
    return firstVisit === null && tourCompleted !== 'true';
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
  };

  const handleShowTour = () => {
    setTourSession((s) => s + 1);
    setIsTourOpen(true);
  };

  return (
    <NotificationProvider
      settings={{
        autoCloseMs: 0,
        borderBottom: true
      }}
    >
      <FormProvider formId="pushNotification">
        <PushNotificationProvider>
          <NotificationLayout
            sidebar={<SelectingRecipientApp isAuthorized={isAuthorized} />}
          >
            <Flex
              as="form"
              direction="column"
              gap={5}
              flex="1"
              p="clamp(12px, 1.7vw + 0.125rem, 24px)"
              maxW="900px"
              mx="auto"
            >
              <IncludeServices />
              <Box data-tour="notification-text">
                {isFetchingTemplates ? (
                  <Center py={10}>
                    <Spinner
                      color="#346895"
                      size="lg"
                      thickness="3px"
                    />
                  </Center>
                ) : (
                  <NotificationContentFields
                    key={templateId || 'new'}
                    formId="pushNotification"
                    initialData={templateData}
                    templates={templates}
                  />
                )}
              </Box>

              <Box data-tour="action-block">
                <ActionFields />
              </Box>
            </Flex>
          </NotificationLayout>
        </PushNotificationProvider>

        {!isTourOpen && (
          <Portal>
            <Box
              as="button"
              role="group"
              position="fixed"
              bottom="71px"
              left="96px"
              onClick={handleShowTour}
              display="flex"
              alignItems="center"
              justifyContent="center"
              h="48px"
              w="48px"
              maxW="48px"
              px={0}
              borderRadius="full"
              bg="#3B6EA0"
              color="white"
              cursor="pointer"
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              overflow="hidden"
              whiteSpace="nowrap"
              _hover={{
                maxW: '400px',
                w: 'max-content',
                px: 4,
                bg: '#2f5a85'
              }}
              zIndex={100}
              boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
              aria-label="Показать подсказки по сервису"
            >
              <Icon
                as={LuLightbulb}
                boxSize="24px"
                transition="opacity 0.2s ease-in-out"
                _groupHover={{ display: 'none' }}
              />

              <Text
                display="none"
                _groupHover={{ display: 'block' }}
                fontSize="sm"
                fontWeight="500"
              >
                Показать подсказки по сервису
              </Text>
            </Box>
          </Portal>
        )}

        <OnboardingTour
          key={tourSession}
          isOpen={isTourOpen}
          onComplete={handleCompleteTour}
        />
      </FormProvider>
    </NotificationProvider>
  );
}
