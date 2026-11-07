import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Text
} from '@chakra-ui/react';
import { memo, type ReactNode } from 'react';

import CustomInput from '@/components/atoms/Input/CustomInput';
import { truncateByMeaningfulLength } from '@/utils/meaningfulLength';

import { FormTextFieldProps } from '../../types/form';
import { useFormField } from '../hooks/useFormField';
import { maxLength as maxLengthValidator } from '../validators/validators';

type FormTextFieldWithRightElementProps = FormTextFieldProps & {
  rightElement?: ReactNode;
};

function FormTextFieldBase({
  name,
  label,
  labelFontSize = '18px',
  initialValue,
  validators,
  subTitlte,
  maxLength,
  softMaxLength = false,
  rightElement,
  ...rest
}: FormTextFieldWithRightElementProps) {
  const allValidators =
    maxLength && !softMaxLength
      ? [...(validators ?? []), maxLengthValidator(maxLength)]
      : validators;

  const { value, error, onChange, onBlur } = useFormField<string>(name, {
    initialValue,
    validators: allValidators
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (maxLength !== undefined && !softMaxLength) {
      const truncated = truncateByMeaningfulLength(e.target.value, maxLength);
      if (truncated !== e.target.value) {
        e.target.value = truncated;
      }
    }
    onChange(e);
  };

  const hasCounter =
    rest.showCounter !== false && typeof maxLength === 'number';
  const input = (
    <CustomInput
      borderColor={error ? 'red.500' : 'inherit'}
      _hover={{ borderColor: error ? 'red.500' : '#3182ce' }}
      _focusVisible={{ borderColor: error ? 'red.500' : '#3182ce' }}
      {...rest}
      pr={rightElement ? (hasCounter ? '120px' : '48px') : rest.pr}
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      maxLength={maxLength}
      softMaxLength={softMaxLength}
    />
  );

  return (
    <FormControl isInvalid={Boolean(error)}>
      {label && (
        <FormLabel
          fontSize={labelFontSize}
          width={'fit-content'}
        >
          {label}
        </FormLabel>
      )}
      {rightElement ? (
        <Box position="relative">
          {input}
          <Box
            position="absolute"
            top={0}
            right={hasCounter ? '72px' : 0}
            zIndex={1}
            h="44px"
            w="48px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {rightElement}
          </Box>
        </Box>
      ) : (
        input
      )}
      {!error && subTitlte && (
        <Text
          mt={2}
          color="gray.600"
          fontSize="xs"
        >
          {subTitlte}
        </Text>
      )}
      {error && (
        <FormErrorMessage
          mt={2}
          color="red.500"
          fontSize="xs"
        >
          {error}
        </FormErrorMessage>
      )}
    </FormControl>
  );
}

export const FormTextField = memo(FormTextFieldBase);
