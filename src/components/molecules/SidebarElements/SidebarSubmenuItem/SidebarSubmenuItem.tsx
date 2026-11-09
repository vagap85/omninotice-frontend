import { ChevronDownIcon } from '@chakra-ui/icons';
import { Box, Flex } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { memo, useId, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { SidebarSubmenuItemProps } from '../../types/sidebar';
import { SidebarSubmenuEntry } from '../SidebarSubmenuEntry/SidebarSubmenuEntry';

const MotionBox = motion.create(Box);

function SidebarSubmenuItemComponent({
  entry,
  showIcon = true,
  showSeparatorBefore = false
}: SidebarSubmenuItemProps) {
  const { label, href, icon, submenuItems } = entry;
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const submenuId = useId();
  const hasSubmenu = Boolean(submenuItems?.length);

  const handleClick = () => {
    if (hasSubmenu) {
      setIsOpen((previous) => !previous);
    }
  };

  return (
    <Box>
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
        href={hasSubmenu ? undefined : href || undefined}
        icon={icon}
        showIcon={showIcon}
        isDisabled={entry.disabled || (!href && !hasSubmenu)}
        isActive={
          !hasSubmenu &&
          Boolean(href) &&
          (location.pathname === href ||
            (href !== '/' && location.pathname.startsWith(`${href}/`)))
        }
        isExpanded={hasSubmenu ? isOpen : undefined}
        controls={hasSubmenu ? submenuId : undefined}
        onClick={hasSubmenu ? handleClick : undefined}
      >
        {hasSubmenu && (
          <MotionBox
            flexShrink={0}
            boxSize="16px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            style={{ transformOrigin: 'center' }}
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <ChevronDownIcon />
          </MotionBox>
        )}
      </SidebarSubmenuEntry>

      {submenuItems && (
        <Box
          id={submenuId}
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
          <Flex
            flexDirection={"column"}
            gap={1}
            minH={0}
            overflow="hidden"
            mt={1}
          >
            {submenuItems.map((item, index) => (
              <SidebarSubmenuItem
                key={`${item.label}-${item.href}-${index}`}
                entry={item}
                showIcon={false}
              />
            ))}
          </Flex>
        </Box>
      )}
    </Box>
  );
}

export const SidebarSubmenuItem = memo(SidebarSubmenuItemComponent);
