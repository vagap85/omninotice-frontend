import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box
} from '@chakra-ui/react';

interface FilterMenuProps {
  label: string;
  options: string[];
  value?: string;
  onSelect?: (value: string) => void;
}

export const FilterMenu = ({
  label,
  options,
  value,
  onSelect
}: FilterMenuProps) => (
  <Box
    display="inline-block"
    position="relative"
  >
    <Menu matchWidth>
      <MenuButton
        as={Button}
        p="14px 20px"
        rightIcon={<ChevronDownIcon />}
        iconSpacing="12px"
        whiteSpace="nowrap"
        variant="outline"
        bg="#F8FAFC"
        fontWeight="normal"
        borderColor="transparent"
        _hover={{ bg: '#F8FAFC', borderColor: '#3B6EA0' }}
        _focus={{ bg: '#F8FAFC', borderColor: '#3B6EA0' }}
        _expanded={{ bg: '#F8FAFC', borderColor: '#3B6EA0' }}
      >
        {value || label}
      </MenuButton>

      <MenuList
        minW="0"
        w="full"
        p="8px"
      >
        {options.map((opt) => (
          <MenuItem
            key={opt}
            fontSize="sm"
            lineHeight="20px"
            py="12px"
            px="16px"
            borderRadius="8px"
            onClick={() => onSelect?.(opt)}
            _hover={{ bg: '#A6C2DE', color: '#2D547B' }}
            color={value === opt ? '#2D547B' : '#12233F'}
          >
            {opt}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  </Box>
);
