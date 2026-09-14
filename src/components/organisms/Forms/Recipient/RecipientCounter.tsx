import { useFormField } from '@/components/molecules/Form/hooks/useFormField';
import { isValidEmail } from '@/utils/recipient';
import { Box, Text } from '@chakra-ui/react';

export default function RecipientsCounter() {
  const { value } = useFormField<string>('emails');
  const tokens = value.trim().split(/\s+/).filter(Boolean);
  const invalidEmails = tokens.filter((e) => !isValidEmail(e));
  const validCount = tokens.length - invalidEmails.length;

  return (
    <>
      <Text fontSize="sm" color="#008667" fontWeight="600" mb={invalidEmails.length ? 2 : 6}>
        Добавлено адресов: {validCount}
      </Text>
      {invalidEmails.length > 0 && (
        <Box mb={4}>
          <Text fontSize="sm" color="#E53E3E" fontWeight="600">
            Ошибки в адресах: {invalidEmails.join(', ')}
          </Text>
          <Text fontSize="xs" color="#E53E3E">
            Можно не удалять их из списка. Добавьте верные адреса для отправки.
          </Text>
        </Box>
      )}
    </>
  );
}