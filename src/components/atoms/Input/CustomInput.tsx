import {
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from '@chakra-ui/react'
import { forwardRef, useEffect, useRef } from 'react'

import { countMeaningfulLength } from '@/utils/meaningfulLength'

import { CustomInputProps } from '../types/types'


const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ value, maxLength, showCounter = true, ...rest }, ref) => {
    const innerRef = useRef<HTMLInputElement>(null)

    const currentLength =
      typeof value === 'string' ? countMeaningfulLength(value) : 0
    const isOverLimit = typeof maxLength === 'number' && currentLength > maxLength
    const hasCounter = showCounter && typeof maxLength === 'number'

    // Пробрасываем maxLength в нативный HTML-атрибут maxlength,
    // т.к. Chakra UI не делает этого автоматически
    useEffect(() => {
      const node = innerRef.current
      if (!node) return
      if (typeof maxLength === 'number') {
        node.setAttribute('maxlength', String(maxLength))
      } else {
        node.removeAttribute('maxlength')
      }
    }, [maxLength])

    const setRefs = (node: HTMLInputElement | null) => {
      innerRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }

    return (
      <InputGroup>
        <Input
          ref={setRefs}
          variant="custom"
          value={value}
          pr={hasCounter ? '72px' : undefined}
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

export default CustomInput