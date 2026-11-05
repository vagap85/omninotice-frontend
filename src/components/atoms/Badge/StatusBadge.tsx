import { Badge } from '@chakra-ui/react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const isError = status === 'error';
  return (
    <Badge
      bg={isError ? '#FEF2F2' : '#F0FDF4'}
      color={isError ? '#EF4444' : '#16A34A'}
      px="8px"
      py="4px"
      borderRadius="6px"
      textTransform="none"
      fontWeight="medium"
      w="100%"
    >
      {isError ? 'ошибка' : 'отправлено'}
    </Badge>
  );
};
