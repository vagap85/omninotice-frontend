import { Box, Text, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/auth/AuthContext';
import { AuthPageLayout } from '@/components/layouts/AuthPageLayout';
import { useFormsRegistry } from '@/components/molecules/Form/hooks/useFormsRegistry';
import { FormProvider } from '@/components/molecules/Form/Providers/FormProvider';
import { FormsRegistryProvider } from '@/components/molecules/Form/Providers/FormsRegistryProvider';
import { AboutYourselfForm } from '@/components/organisms/Forms/Auth/AboutYourselfForm';
import { getAuthRedirectPath } from '@/routing/authRedirect';
import { profileService } from '@/services/profile';

export default function AboutYourselfPage() {
  return (
    <FormsRegistryProvider>
      <FormProvider formId="aboutYourself">
        <AboutYourselfPageContent />
      </FormProvider>
    </FormsRegistryProvider>
  );
}

function AboutYourselfPageContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const registry = useFormsRegistry();
  const { authState, updateUser } = useAuth();
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const store = registry.getOrCreateStore('aboutYourself');
    if (!store.validateAll()) return;

    const { firstName, lastName, position, phone } = store.getValues<{
      firstName: string;
      lastName: string;
      position: string;
      phone: string;
    }>();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    setGeneralError('');
    setIsLoading(true);

    try {
      await profileService.saveProfile({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        position: position.trim(),
        phone: phone.trim(),
        email: authState?.login || ''
      });

      updateUser({
        firstName: trimmedFirstName,
        lastName: trimmedLastName
      });

      toast({
        position: 'bottom',
        duration: 4000,
        isClosable: true,
        render: () => (
          <Box
            bg="#1FAE4B"
            color="white"
            px={5}
            py={4}
            borderRadius="16px"
            boxShadow="lg"
            minW="470px"
          >
            <Text
              fontWeight="700"
              mb={1}
            >
              Данные успешно сохранены
            </Text>
            <Text>Теперь можно отправлять рассылки и улучшать текст</Text>
          </Box>
        )
      });

      navigate(getAuthRedirectPath(location.state), { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при сохранении данных';
      setGeneralError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageLayout>
      <AboutYourselfForm
        isLoading={isLoading}
        generalError={generalError}
        onSubmit={handleSubmit}
      />
    </AuthPageLayout>
  );
}
