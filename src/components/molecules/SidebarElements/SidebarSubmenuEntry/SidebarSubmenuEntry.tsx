import { Box, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

import CustomButton from '@/components/atoms/Button/CustomButton';

import { SidebarSubmenuEntryProps } from '../../types/sidebar';

export function SidebarSubmenuEntry({
  label,
  href,
  icon,
  showIcon = true,
  isDisabled = false,
  isActive = false,
  isExpanded,
  controls,
  minW,
  iconContainerSize,
  onClick,
  children
}: SidebarSubmenuEntryProps) {
  const isLink = Boolean(href) && !onClick && !isDisabled;
  const isButtonDisabled = isDisabled || (!href && !onClick);

  return (
    <CustomButton
      as={isLink ? Link : 'button'}
      to={isLink ? href : undefined}
      type={isLink ? undefined : 'button'}
      onClick={onClick}
      variant="ghost"
      aria-expanded={isExpanded}
      aria-controls={controls}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap={3}
      pl={showIcon && icon ? '18px' : '28px'}
      pr="18px"
      py={3}
      borderRadius="8px"
      opacity={isButtonDisabled ? 0.6 : 1}
      cursor={isButtonDisabled ? 'default' : 'pointer'}
      isDisabled={isButtonDisabled}
      minW={minW}
      w="full"
      bg={isActive ? '#A6C2DE' : undefined}
      _hover={
        isButtonDisabled
          ? undefined
          : isActive
            ? { bg: '#95B5D5' }
            : { bg: 'brand.60' }
      }
    >
      {showIcon && icon && (
        <Box
          display={iconContainerSize ? 'flex' : undefined}
          alignItems={iconContainerSize ? 'center' : undefined}
          justifyContent={iconContainerSize ? 'center' : undefined}
          boxSize={iconContainerSize}
          borderRadius={iconContainerSize ? '8px' : undefined}
          flexShrink={0}
        >
          {icon}
        </Box>
      )}
      <Text
        flex={1}
        minW={0}
        textAlign="left"
        fontSize="16px"
        fontWeight="500"
        color="#12233F"
        noOfLines={1}
      >
        {label}
      </Text>
      {children}
    </CustomButton>
  );
}
