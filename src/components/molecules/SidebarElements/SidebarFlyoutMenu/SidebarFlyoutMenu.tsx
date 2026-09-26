import { Box, Flex, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

import { SidebarSubmenuEntry } from '../SidebarSubmenuEntry/SidebarSubmenuEntry';
import { SidebarSubmenuItem } from '../SidebarSubmenuItem/SidebarSubmenuItem';
import { SidebarFlyoutMenuProps } from '../../types/sidebar';

const MotionBox = motion.create(Box);

export function SidebarFlyoutMenu({
  submenuItems,
  title,
  isCollapsed,
  showIcons
}: SidebarFlyoutMenuProps) {
  const location = useLocation();

  return (
    <MotionBox
      position="absolute"
      top={0}
      left="calc(100% + 10px)"
      w="fit-content"
      bg="white"
      borderRadius="13px"
      boxShadow="0 0 0.5px rgba(24,24,27,0.3), 0 8px 8px rgba(24,24,27,0.1)"
      p={3}
      px={3}
      py={3}
      zIndex={20}
      border={'1px solid #E2EBF3'}
      style={{ transformOrigin: 'top left' }}
      initial={{ opacity: 0, scale: 0.9, x: -12, y: -8 }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: -12, y: -8 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {isCollapsed && !showIcons && (
        <Text
          px="18px"
          pb={2}
          fontWeight="600"
          color="brand.450"
          noOfLines={1}
        >
          {title}
        </Text>
      )}
      <Flex
        as="ul"
        flexDirection="column"
        gap={1}
        listStyleType="none"
        m={0}
        p={0}
      >
        {submenuItems.map((entry, index) => {
          const {
            label,
            icon,
            href,
            disabled,
            submenuItems: nestedSubmenuItems
          } = entry;
          const hasHref = Boolean(href);
          const key = `${label}-${href}-${index}`;
          const showSeparatorBefore =
            isCollapsed &&
            !showIcons &&
            Boolean(disabled) &&
            !submenuItems[index - 1]?.disabled;

          if (nestedSubmenuItems?.length) {
            return (
              <Box
                as="li"
                key={key}
              >
                {showSeparatorBefore && (
                  <Box
                    as="hr"
                    aria-orientation="horizontal"
                    h="1px"
                    w="full"
                    border={0}
                    bg="gray.100"
                    mt="6px"
                  />
                )}
                <SidebarSubmenuItem
                  entry={{
                    label,
                    href,
                    icon,
                    submenuItems: nestedSubmenuItems
                  }}
                  showIcon={showIcons}
                />
              </Box>
            );
          }

          return (
            <Box
              as="li"
              key={key}
            >
              {showSeparatorBefore && (
                <Box
                  as="hr"
                  aria-orientation="horizontal"
                  h="1px"
                  w="full"
                  border={0}
                  bg="gray.100"
                  mt="6px"
                />
              )}
              <SidebarSubmenuEntry
                label={label}
                href={hasHref ? href : undefined}
                icon={icon}
                showIcon={showIcons}
                isDisabled={disabled || !hasHref}
                isActive={hasHref && location.pathname === href}
                minW="220px"
                iconContainerSize="22px"
              />
            </Box>
          );
        })}
      </Flex>
    </MotionBox>
  );
}
