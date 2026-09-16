import {
  InputGroup,
  InputRightElement,
  Text,
  Textarea
} from '@chakra-ui/react'
import { forwardRef } from 'react'

import type { CustomTextareaProps } from '../types/types'

const CustomTextarea = forwardRef<HTMLTextAreaElement, CustomTextareaProps>(
  ({ value, maxLength, showCounter = true, ...rest }, ref) => {
    const currentLength = typeof value === 'string' ? value.length : 0
    const isOverLimit = typeof maxLength === 'number' && currentLength > maxLength
    const hasCounter = showCounter && typeof maxLength === 'number'

    return (
      <InputGroup>
        <Textarea
          ref={ref}
          variant="custom"
          value={value}
          maxLength={maxLength}
          pr={hasCounter ? '70px' : undefined}
          borderColor={isOverLimit ? 'error.500' : 'gray.200'}
          _hover={{ borderColor: isOverLimit ? 'error.500' : '#3182ce' }}
          _focusVisible={{ borderColor: isOverLimit ? 'error.500' : '#3182ce' }}
          {...rest}
        />
        {hasCounter && (
          <InputRightElement h="44px" w="72px" pointerEvents="none">
            <Text color={isOverLimit ? 'error.500' : 'gray.400'} fontSize="md">
              {currentLength}/{maxLength}
            </Text>
          </InputRightElement>
        )}
      </InputGroup>
    )
  }
)

CustomTextarea.displayName = 'CustomTextarea'

export default CustomTextarea