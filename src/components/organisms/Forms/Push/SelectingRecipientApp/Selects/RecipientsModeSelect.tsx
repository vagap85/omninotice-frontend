import { Box, Radio, RadioGroup, Stack } from '@chakra-ui/react';

import type { RecipientsMode } from '../types/types';

interface RecipientsModeSelectProps {
  value: RecipientsMode;
  onChange: (mode: RecipientsMode) => void;
  isDisabled: boolean;
}

const rowStyles = {
  w: 'full',
  px: '18px',
  py: 3,
  bg: '#F8FAFC',
  borderRadius: '10px',
  border: '1px solid',
  borderColor: '#E2EBF3',
  cursor: 'pointer'
};

const controlStyles = {
  '.chakra-radio__control': {
    borderColor: '#CBD5E1',
    _checked: { bg: '#3B6EA0', borderColor: '#2563EB' }
  },
  '&::before': {
    width: '6px',
    height: '6px',
    transform: 'translateX(0.5px)'
  },
  '.chakra-radio__label': {
    marginLeft: '12px',
    fontSize: 'md',
    color: '#12233F',
    backgroundColor: '#F8FAFC',
    outline: '1px solid #E2EBF3'
  }
};

const recipientOptions: {
  value: RecipientsMode;
  label: string;
  fill?: string;
}[] = [
  { value: 'all', label: 'Все пользователи' },
  { value: 'individual', label: 'Отдельные пользователи', fill: '#3B6EA0' }
];

export default function RecipientsModeSelect({
  value,
  onChange,
  isDisabled
}: RecipientsModeSelectProps) {
  const handleChange = (nextValue: string) => {
    if (nextValue === 'all' || nextValue === 'individual') {
      onChange(nextValue);
    }
  };

  return (
    <RadioGroup
      value={value}
      onChange={handleChange}
      isDisabled={isDisabled}
      data-tour="recipients-select"
    >
      <Stack spacing={2}>
        {recipientOptions.map((option) => (
          <Box
            key={option.value}
            bg="#F8FAFC"
            border="1px solid #E2EBF3"
            borderRadius="10px"
          >
            <Radio
              value={option.value}
              colorScheme="blue"
              fill={option.fill}
              sx={controlStyles}
              {...rowStyles}
            >
              {option.label}
            </Radio>
          </Box>
        ))}
      </Stack>
    </RadioGroup>
  );
}
