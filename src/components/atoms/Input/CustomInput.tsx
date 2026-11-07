import { Input, InputGroup, InputRightElement, Text } from '@chakra-ui/react';
import { forwardRef } from 'react';

import { countMeaningfulLength } from '@/utils/meaningfulLength';

import { CustomInputProps } from '../types/types';

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  (
    { value, maxLength, showCounter = true, softMaxLength = false, ...rest },
    ref
  ) => {
    const currentLength =
      typeof value === 'string' ? countMeaningfulLength(value) : 0;
    const isOverLimit =
      typeof maxLength === 'number' && currentLength > maxLength;
    const hasCounter = showCounter && typeof maxLength === 'number';

    return (
      <InputGroup>
        <Input
          ref={ref}
          variant="custom"
          value={value}
          maxLength={softMaxLength ? undefined : maxLength}
          pr={hasCounter ? '72px' : undefined}
          borderColor={isOverLimit ? 'error.500' : 'gray.200'}
          _hover={{ borderColor: isOverLimit ? 'error.500' : '#3182ce' }}
          _focusVisible={{ borderColor: isOverLimit ? 'error.500' : '#3182ce' }}
          {...rest}
        />
        {hasCounter && (
          <InputRightElement
            h="44px"
            w="72px"
            pointerEvents="none"
          >
            <Text
              color={isOverLimit ? 'error.500' : 'gray.400'}
              fontSize="md"
            >
              {currentLength}/{maxLength}
            </Text>
          </InputRightElement>
        )}
      </InputGroup>
    );
  }
);

export default CustomInput;
