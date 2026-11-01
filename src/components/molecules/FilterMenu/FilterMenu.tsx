import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box,
  Flex,
  Text
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
    display="block"
    position="relative"
    w="full"
  >
    <Menu matchWidth>
      {({ isOpen }) => (
        <>
          <MenuButton
            as={Button}
            w="full"
            p="14px 20px"
            variant="outline"
            bg="#F8FAFC"
            fontWeight="normal"
            borderColor="transparent"
            _hover={{ bg: '#F8FAFC', borderColor: '#3B6EA0' }}
            _focus={{ bg: '#F8FAFC', borderColor: '#3B6EA0' }}
            _expanded={{ bg: '#F8FAFC', borderColor: '#3B6EA0' }}
          >
            <Flex
              w="full"
              justify="space-between"
              align="center"
              gap="8px"
            >
              {/* isTruncated аккуратно обрежет длинный текст, не задевая стрелку */}
              <Text
                isTruncated
                color="#12233F"
              >
                {value || label}
              </Text>

              {/* Стрелка всегда видима, меняет цвет и крутится на 180 градусов */}
              <ChevronDownIcon
                color="#12233F"
                boxSize="16px"
                flexShrink={0} // Запрещаем сжимать стрелку
                transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                transition="transform 0.2s ease"
              />
            </Flex>
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
        </>
      )}
    </Menu>
  </Box>
);
