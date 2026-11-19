import { ChevronDownIcon } from '@chakra-ui/icons';
import { Box, Flex, Icon, Text, useOutsideClick } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useRef, useState } from 'react';

export interface DropdownSelectOption {
  id: string;
  label: string;
  count?: number;
  isActive?: boolean;
}

interface DropdownSelectProps {
  label: string;
  placeholder: string;
  value: string | null;
  options: DropdownSelectOption[];
  onSelect: (option: DropdownSelectOption) => void;
  error?: string | null;
  helperText?: string;
  dataTour?: string;
  children?: ReactNode;
}

const MotionBox = motion.create(Box);

export default function DropdownSelect({
  label,
  placeholder,
  value,
  options,
  onSelect,
  error,
  helperText,
  dataTour,
  children
}: DropdownSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((option) => option.id === value);

  useOutsideClick({
    ref: containerRef,
    handler: () => setIsOpen(false)
  });

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen((open) => !open);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen) setIsOpen(true);
      requestAnimationFrame(() => {
        listRef.current
          ?.querySelector<HTMLButtonElement>('[role="option"]:not([disabled])')
          ?.focus();
      });
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <Box>
      <Text
        fontSize="lg"
        mb={1.5}
        color="#12233F"
      >
        {label}
      </Text>

      <Box
        ref={containerRef}
        position="relative"
        w="100%"
      >
        <Flex
          data-tour={dataTour}
          ref={triggerRef}
          as="button"
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          onKeyDown={handleTriggerKeyDown}
          align="center"
          justify="space-between"
          w="100%"
          px="18px"
          py={2.5}
          bg="#F8FAFC"
          borderRadius="10px"
          border="1px solid"
          borderColor={error ? 'red.500' : '#E2EBF3'}
          cursor="pointer"
        >
          <Text
            color="#12233F"
            fontSize="md"
            lineHeight={6}
          >
            {selected ? selected.label : placeholder}
          </Text>
          <Icon
            as={ChevronDownIcon}
            boxSize={5}
            color="#12233F"
            transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
            transition="transform 0.2s ease"
          />
        </Flex>

        <MotionBox
          position="relative"
          overflow="hidden"
          initial={false}
          transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Box
            mt={1.5}
            position={isOpen ? 'absolute' : 'relative'}
            top={isOpen ? 0 : undefined}
            left={0}
            right={0}
            opacity={isOpen ? 0 : 1}
            transition="opacity 0.01s ease"
            pointerEvents={isOpen ? 'none' : 'auto'}
          >
            {error ? (
              <Text
                color="red.500"
                fontSize="xs"
                fontWeight="normal"
              >
                {error}
              </Text>
            ) : helperText ? (
              <Text
                color="#52525B"
                fontSize="xs"
                fontWeight="normal"
              >
                {helperText}
              </Text>
            ) : null}
          </Box>

          <Box
            mt={2}
            position={isOpen ? 'relative' : 'absolute'}
            left={0}
            right={0}
            opacity={isOpen ? 1 : 0}
            pointerEvents={isOpen ? 'auto' : 'none'}
          >
            <Box
              bg="white"
              borderRadius="10px"
              border="1px solid"
              borderColor="#E2EBF3"
              boxShadow="0 8px 24px rgba(18, 35, 63, 0.08)"
              overflow="hidden"
            >
              <Box
                ref={listRef}
                role="listbox"
                aria-label={label}
              >
                {options.map((option) => {
                  const isSelected = value === option.id;
                  const isActive = option.isActive !== false;

                  return (
                    <Flex
                      key={option.id}
                      as="button"
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      tabIndex={isOpen ? 0 : -1}
                      onClick={() => {
                        if (!isActive) return;
                        onSelect(option);
                        setIsOpen(false);
                        triggerRef.current?.focus();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Escape') {
                          setIsOpen(false);
                          triggerRef.current?.focus();
                        }
                      }}
                      w="100%"
                      align="center"
                      justify="space-between"
                      px={5}
                      py={2.5}
                      bg={isSelected && isActive ? 'gray.50' : 'transparent'}
                      _hover={{
                        bg: isActive ? 'gray.50' : 'transparent'
                      }}
                      cursor={isActive ? 'pointer' : 'unset'}
                      disabled={!isActive}
                    >
                      <Text
                        fontSize="md"
                        color={isActive ? '#12233F' : '#8A8A99'}
                        lineHeight={6}
                      >
                        {option.label}
                      </Text>
                      {option.count !== undefined && (
                        <Text
                          fontSize="sm"
                          color="#A1A1AA"
                        >
                          {option.count}
                        </Text>
                      )}
                    </Flex>
                  );
                })}
              </Box>
              {children}
            </Box>
          </Box>
        </MotionBox>
      </Box>
    </Box>
  );
}
