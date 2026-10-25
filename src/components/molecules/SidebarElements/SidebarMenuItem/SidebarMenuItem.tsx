import { Box, Flex, Text } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { type ElementType, memo, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

import CustomButton from '@/components/atoms/Button/CustomButton';
import { useSidebar } from '@/components/organisms/Sidebar/SidebarContext';

import { SidebarMenuItemProps } from '../../types/sidebar';
import { SidebarFlyoutMenu } from '../SidebarFlyoutMenu/SidebarFlyoutMenu';
import { SidebarSubmenuItem } from '../SidebarSubmenuItem/SidebarSubmenuItem';

const MotionBox = motion.create(Box);

function SidebarMenuItemComponent({
  leftIcon,
  rightIcon,
  text,
  href,
  as = 'button',
  submenuItems,
  isOpen,
  onToggle,
  submenuType = 'outside',
  animateRightIcon = true,
  btnVariant = 'ghost',
  onClick: onActionClick,
  ...rest
}: SidebarMenuItemProps) {
  const { isCollapsed } = useSidebar();
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);
  const hasSubmenu = Boolean(submenuItems?.length);
  const effectiveSubmenuType = isCollapsed ? 'outside' : submenuType;
  const visibleRightIcon =
    isCollapsed && btnVariant !== 'primary' ? undefined : rightIcon;
  const sortedSubmenuItems = submenuItems
    ? [...submenuItems].sort(
        (firstItem, secondItem) =>
          Number(!firstItem.href) - Number(!secondItem.href)
      )
    : [];

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        onToggle?.(text);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen, onToggle, text]);

  const handleClick = () => {
    onActionClick?.();
    if (hasSubmenu) {
      onToggle?.(text);
    }
  };

  const isLink = as === 'a' && Boolean(href);

  const IconWrapper: ElementType = animateRightIcon ? MotionBox : Box;
  const motionProps = animateRightIcon
    ? {
        style: { transformOrigin: 'center' },
        animate: { rotate: isOpen ? 180 : 0 },
        transition: { duration: 0.1, ease: 'easeInOut' }
      }
    : {};

  return (
    <Box
      ref={rootRef}
      position="relative"
      bg={
        isOpen && submenuType == 'inside' && as == 'button'
          ? '#F8FAFC'
          : location.pathname === href
            ? '#A6C2DE'
            : undefined
      }
      borderRadius={'8px'}
      w={isCollapsed ? '40px' : '100%'}
      h={isCollapsed ? '40px' : undefined}
      mb={isCollapsed && btnVariant == 'primary' ? '20px' : undefined}
    >
      <CustomButton
        as={isLink ? Link : 'button'}
        to={isLink ? href : undefined}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={handleClick}
        display={'flex'}
        alignItems={'center'}
        justifyContent={isCollapsed ? 'center' : 'space-between'}
        borderRadius={'8px'}
        gap={3}
        py={3}
        px={2.5}
        w={'full'}
        p={isCollapsed ? 0 : undefined}
        variant={btnVariant}
        _hover={btnVariant === 'ghost' ? { bgColor: 'brand.60' } : undefined}
        aria-label={isCollapsed ? text : undefined}
        fontSize={'sm'}
        bg={isCollapsed && location.pathname === href ? '#A6C2DE' : undefined}
        {...rest}
      >
        {(leftIcon || !isCollapsed) && (
          <Flex
            gap={2}
            alignItems={'center'}
          >
            {leftIcon && <Box flexShrink={0}>{leftIcon}</Box>}
            {!isCollapsed && (
              <Text
                lineHeight={6}
                fontWeight={location.pathname === href ? 'semibold' : 'medium'}
                noOfLines={1}
                minW={0}
              >
                {text}
              </Text>
            )}
          </Flex>
        )}
        {visibleRightIcon && (
          <IconWrapper
            flexShrink={0}
            boxSize="16px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            {...motionProps}
          >
            {visibleRightIcon}
          </IconWrapper>
        )}
      </CustomButton>

      {effectiveSubmenuType === 'inside' && submenuItems && (
        <Box
          display="grid"
          gridTemplateRows={isOpen ? '1fr' : '0fr'}
          transition={
            isOpen
              ? 'grid-template-rows 200ms ease-in-out, visibility 0s linear'
              : 'grid-template-rows 200ms ease-in-out, visibility 0s linear 200ms'
          }
          visibility={isOpen ? 'visible' : 'hidden'}
          aria-hidden={!isOpen}
          pointerEvents={isOpen ? undefined : 'none'}
        >
          <Box
            minH={0}
            overflow="hidden"
            px={2}
          >
            <Box pb="20px">
              {sortedSubmenuItems.map((entry, idx) => {
                const showSeparatorBefore =
                  !entry.href &&
                  (idx === 0 || Boolean(sortedSubmenuItems[idx - 1].href));

                return (
                  <SidebarSubmenuItem
                    key={`${entry.label}-${entry.href}-${idx}`}
                    entry={entry}
                    showIcon={false}
                    showSeparatorBefore={showSeparatorBefore}
                  />
                );
              })}
            </Box>
          </Box>
        </Box>
      )}

      <AnimatePresence>
        {isOpen && submenuItems && effectiveSubmenuType == 'outside' && (
          <SidebarFlyoutMenu
            key="submenu-outside"
            title={text}
            isCollapsed={isCollapsed}
            showIcons={btnVariant === 'primary'}
            submenuItems={submenuItems}
          />
        )}
      </AnimatePresence>
    </Box>
  );
}

export const SidebarMenuItem = memo(SidebarMenuItemComponent);
