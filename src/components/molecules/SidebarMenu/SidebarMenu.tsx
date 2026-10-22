import { Flex } from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';

import {
  sidebarCreateAction,
  sidebarMenuItems
} from '@/components/organisms/Sidebar/SidebarConfig.config';
import { useSidebar } from '@/components/organisms/Sidebar/SidebarContext';

import { SidebarMenuItem } from '../SidebarElements/SidebarMenuItem/SidebarMenuItem';

export function SidebarMenu() {
  const { isCollapsed } = useSidebar();
  const { pathname } = useLocation();
  const [openMenu, setOpenMenu] = useState<{
    pathname: string;
    id: string;
  } | null>(null);
  const openId = openMenu?.pathname === pathname ? openMenu.id : null;

  const handleToggle = useCallback(
    (id: string) => {
      setOpenMenu((previous) =>
        previous?.pathname === pathname && previous.id === id
          ? null
          : { pathname, id }
      );
    },
    [pathname]
  );

  return (
    <Flex
      as={'menu'}
      p={0}
      m={0}
      direction={'column'}
      gap={2}
    >
      <SidebarMenuItem
        justifyContent={'center'}
        btnVariant={'primary'}
        text={sidebarCreateAction.text}
        lineHeight={6}
        borderRadius={isCollapsed ? '8px' : 'xl'}
        rightIcon={sidebarCreateAction.icon}
        animateRightIcon={false}
        mb={6}
        fontSize={'16px'}
        submenuItems={sidebarCreateAction.submenuItems}
        isOpen={openId === 'Создать рассылку'}
        onToggle={handleToggle}
      />
      {sidebarMenuItems.map((item) => (
        <SidebarMenuItem
          key={item.text}
          {...item}
          isOpen={openId === item.text}
          onToggle={handleToggle}
        />
      ))}
    </Flex>
  );
}
