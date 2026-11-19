import { Flex } from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import type { SidebarMenuEntry } from '@/components/molecules/types/sidebar';
import {
  sidebarCreateAction,
  sidebarMenuItems
} from '@/components/organisms/Sidebar/SidebarConfig.config';
import { useSidebar } from '@/components/organisms/Sidebar/SidebarContext';

import { SidebarMenuItem } from '../SidebarElements/SidebarMenuItem/SidebarMenuItem';

function isRouteMatchingSubmenu(
  pathname: string,
  submenuItems?: SidebarMenuEntry[]
): boolean {
  if (!submenuItems) return false;
  return submenuItems.some((entry) => {
    if (entry.href) {
      if (pathname === entry.href) return true;
      if (entry.href !== '/' && pathname.startsWith(`${entry.href}/`)) return true;
    }
    if (entry.submenuItems) {
      return isRouteMatchingSubmenu(pathname, entry.submenuItems);
    }
    return false;
  });
}

export function SidebarMenu() {
  const { isCollapsed } = useSidebar();
  const { pathname } = useLocation();

  const activeMenuId = useMemo(() => {
    const normalized = pathname.replace(/\/+$/, '') || '/';
    for (const item of sidebarMenuItems) {
      if (
        item.submenuItems &&
        isRouteMatchingSubmenu(normalized, item.submenuItems)
      ) {
        return item.text;
      }
    }
    return null;
  }, [pathname]);

  const [openId, setOpenId] = useState<string | null>(activeMenuId);
  const prevActiveMenuIdRef = useRef<string | null>(activeMenuId);

  useEffect(() => {
    if (activeMenuId && activeMenuId !== prevActiveMenuIdRef.current) {
      setOpenId(activeMenuId);
    }
    prevActiveMenuIdRef.current = activeMenuId;
  }, [activeMenuId]);

  const handleToggle = useCallback((id: string) => {
    setOpenId((previous) => (previous === id ? null : id));
  }, []);

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
