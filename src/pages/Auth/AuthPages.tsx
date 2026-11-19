import { Flex, Text } from '@chakra-ui/react';
import { lazy, Suspense } from 'react';

import SpinnerLoader from '@/components/atoms/Loaders/SpinnerLoader/SpinnerLoader';
import { FormsRegistryProvider } from '@/components/molecules/Form/Providers/FormsRegistryProvider';

import { AuthPageLayout } from '../../components/layouts/AuthPageLayout';

const AuthLoginPage = lazy(() => import('./AuthLoginPage'));
const AuthRegisterPage = lazy(() => import('./AuthRegisterPage'));

type AuthMode = 'login' | 'register';

function AuthFormLoader() {
  return (
    <Flex
      minH="180px"
      align="center"
      justify="center"
    >
      <SpinnerLoader />
    </Flex>
  );
}

export default function AuthPages({ mode }: { mode: AuthMode }) {
  return (
    <FormsRegistryProvider>
      <AuthPageLayout
        footer={
          mode === 'login' ? (
            <Text
              color="#2D547B"
              fontSize="14px"
              fontWeight="500"
            >
              Не помню пароль
            </Text>
          ) : undefined
        }
      >
        <Suspense fallback={<AuthFormLoader />}>
          {mode === 'login' ? <AuthLoginPage /> : <AuthRegisterPage />}
        </Suspense>
      </AuthPageLayout>
    </FormsRegistryProvider>
  );
}
