import { Flex, Box } from '@chakra-ui/react';
import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/auth/AuthContext';
import SpinnerLoader from '@/components/atoms/Loaders/SpinnerLoader/SpinnerLoader';
import PageHeader from '@/components/molecules/PageHeader/PageHeader';
import { Sidebar } from '@/components/organisms/Sidebar/Sidebar';

const pageTitles: Record<string, string> = {
  '/create/email': 'Создание e-mail рассылки',
  '/create/push': 'Создание рассылки push-уведомлений',
  '/overview': 'Обзор',
  '/templates': 'Шаблоны рассылок',
  '/profile': 'Настройка профиля',
  '/dashboard/profile': 'Настройка профиля'
};

function SidebarLayout() {
  const { pathname } = useLocation();
  const { isAuthorized } = useAuth();

  return (
    <Flex
      minH="100vh"
      alignItems="stretch"
    >
      <Sidebar />
      <Flex
        flex={1}
        minW={0}
        direction="column"
      >
        <PageHeader
          isAuthorized={isAuthorized}
          title={pageTitles[pathname] ?? ''}
        />
        <Box as="main">
          <Suspense
            fallback={
              <Flex
                minH="100dvh"
                justifyContent="center"
                alignItems="center"
                bg="#ECF2F8"
              >
                <SpinnerLoader />
              </Flex>
            }
          >
            <Outlet />
          </Suspense>
        </Box>
      </Flex>
    </Flex>
  );
}

export default SidebarLayout;
