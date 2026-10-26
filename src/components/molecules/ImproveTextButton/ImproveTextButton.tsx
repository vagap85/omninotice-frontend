import { Button } from '@chakra-ui/react';
import { LuSparkles } from 'react-icons/lu';

interface ImproveTextButtonProps {
  isDisabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
}

export default function ImproveTextButton({
  isDisabled = false,
  isLoading = false,
  onClick
}: ImproveTextButtonProps) {
  return (
    <Button
      variant="accent"
      leftIcon={<LuSparkles size={20} />}
      color="white"
      borderRadius="12px"
      h="auto"
      px={5}
      py={3}
      onClick={onClick}
      loadingText="Обработка..."
      isDisabled={isDisabled}
      isLoading={isLoading}
      whiteSpace="normal"
      lineHeight="1.5em"
    >
      Улучшить текст
    </Button>
  );
}
