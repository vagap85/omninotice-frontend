import { Flex } from '@chakra-ui/react';
import { memo } from 'react';
import { useLocation } from 'react-router-dom';

import LogoFigmaIcon from '@/components/atoms/Icons/home/LogoFigmaIcon';
import { LogoMini } from '@/components/atoms/Icons/LogoMini';
import { SidebarMenu } from '@/components/molecules/SidebarMenu/SidebarMenu';
import { COLLAPSED_SIDEBAR_ROUTES, ROUTES } from '@/routing/routes';

import { SidebarProvider, useSidebar } from './SidebarContext';

function SidebarContent() {
  const { isCollapsed } = useSidebar();

  return (
    <Flex
      as="nav"
      alignSelf="flex-start"
      maxW={isCollapsed ? '80px' : '240px'}
      position={'sticky'}
      zIndex={999}
      top={0}
      w={'100%'}
      minH="100vh"
      flexShrink={0}
      padding={'20px'}
      bg={'white'}
      direction={'column'}
      gap={'60px'}
      transition="max-width 0.2s ease"
    >
      <Flex
        as={'a'}
        href={ROUTES.home}
        alignItems={'center'}
        justifyContent={'center'}
        w={'full'}
        h={isCollapsed ? '52px' : undefined}
      >
        {isCollapsed ? (
          <LogoMini />
        ) : (
          <LogoFigmaIcon
            width={180}
            height={66}
          />
        )}
      </Flex>
      <SidebarMenu />
    </Flex>
  );
}

function SidebarComponent() {
  const { pathname } = useLocation();
  const normalizedPathname =
    pathname.replace(/\/+$/, '') || ROUTES.home;
  const isCollapsed = COLLAPSED_SIDEBAR_ROUTES.some(
    (route) => route === normalizedPathname
  );

  return (
    <SidebarProvider isCollapsed={isCollapsed}>
      <SidebarContent />
    </SidebarProvider>
  );
}

export const Sidebar = memo(SidebarComponent);
