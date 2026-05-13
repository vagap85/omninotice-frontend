import {
  Box,
  Button,
  Heading,
  Text,
  Textarea,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { useEffect, useRef, useState } from "react";
import ModalSend from "./ModalSend";
import { isValidEmail } from "../utils/recipient";

type SendStatus = "confirm" | "loading" | "error";
type ValidationError = {
  title: string;
  description: string;
};

interface AddRecipientsBarProps {
  recipients: string;
  onRecipientsChange: (value: string) => void;
  onSend: () => Promise<void>;
  canSend: boolean;
  onAuthClick: () => void;
  onValidateBeforeSend: () => ValidationError | null;
}

export default function AddRecipientsBar({
  recipients,
  onRecipientsChange,
  onSend,
  canSend,
  onAuthClick,
  onValidateBeforeSend,
}: AddRecipientsBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<SendStatus>("confirm");
  const [progress, setProgress] = useState(0);

  const toast = useToast();
  const intervalRef = useRef<number | null>(null);

  const recipientsTokens = recipients.trim().split(/\s+/).filter(Boolean);
  const validEmails = recipientsTokens.filter((email) => isValidEmail(email));
  const invalidEmails = recipientsTokens.filter((email) => !isValidEmail(email));
  const recipientsCount = validEmails.length;

  const showErrorToast = (title: string, description: string) => {
    toast({
      position: "bottom",
      duration: 4000,
      isClosable: true,
      render: () => (
        <Box
          bg="#E53E3E"
          color="white"
          px={5}
          py={4}
          borderRadius="16px"
          boxShadow="lg"
          minW="470px"
        >
          <Text fontWeight="700" mb={1}>
            {title}
          </Text>
          <Text>{description}</Text>
        </Box>
      ),
    });
  };

  const openModal = () => {
    const validationError = onValidateBeforeSend();
    if (validationError) {
      showErrorToast(validationError.title, validationError.description);
      return;
    }

    if (recipientsCount === 0) {
      showErrorToast(
        "Нет корректных email для отправки",
        "Проверьте адреса и добавьте хотя бы один валидный email.",
      );
      return;
    }
    setStatus("confirm");
    setProgress(0);
    setIsOpen(true);
  };

  const clearProgressInterval = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startProgress = () => {
    clearProgressInterval();
    setProgress(0);

    let current = 0;

    intervalRef.current = window.setInterval(() => {
      current += 4;

      if (current >= 90) {
        current = 90;
      }

      setProgress(current);
    }, 120);
  };

  const finishProgress = () => {
    clearProgressInterval();
    setProgress(100);
  };

  const handleClose = () => {
    clearProgressInterval();
    setIsOpen(false);
    setStatus("confirm");
    setProgress(0);
  };

  const handleSend = async () => {
    setStatus("loading");
    startProgress();

    try {
      await onSend();

      finishProgress();

      setTimeout(() => {
        setIsOpen(false);
        setStatus("confirm");
        setProgress(0);

        toast({
          position: "bottom",
          duration: 4000,
          isClosable: true,
          render: () => (
            <Box
              bg="#1FAE4B"
              color="white"
              px={5}
              py={4}
              borderRadius="16px"
              boxShadow="lg"
              minW="470px"
            >
              <Text fontWeight="700" mb={1}>
                Рассылка успешно отправлена
              </Text>
              <Text>
                Мы отправили письма на {recipientsCount} электронных адресов
              </Text>
            </Box>
          ),
        });
      }, 300);
    } catch (error) {
      clearProgressInterval();
      const message =
        error instanceof Error ? error.message : "При отправке произошла ошибка";

      if (message === "Нет корректных email адресов для отправки") {
        setIsOpen(false);
        setStatus("confirm");
        setProgress(0);
        showErrorToast(
          "Нет корректных email для отправки",
          "Проверьте адреса и добавьте хотя бы один валидный email.",
        );
        return;
      }

      setProgress(55);
      setStatus("error");
    }
  };

  useEffect(() => {
    return () => clearProgressInterval();
  }, []);

  return (
    <Box
      w="360px"
      bg="white"
      px={6}
      py={5}
      borderLeft="1px solid"
      borderColor="gray.200"
      minH="calc(100vh - 73px)"
    >
      <Heading size="md" mb={6}>
        Настройка рассылки
      </Heading>

      <Text fontSize="sm" fontWeight="500" mb={2}>
        Получатели
      </Text>

      <Textarea
        value={recipients}
        onChange={(e) => onRecipientsChange(e.target.value)}
        placeholder="example@mail.com user@yandex.ru client@gmail.com"
        resize="vertical"
        minH="180px"
        bg="gray.50"
        borderColor="gray.200"
        mb={3}
      />

      <Text fontSize="xs" color="gray.500" mb={2}>
        Введите электронные адреса всех получателей через пробел
      </Text>

      <Text fontSize="sm" color="#008667" fontWeight="600" mb={6}>
        Добавлено адресов: {recipientsCount}
      </Text>
      {invalidEmails.length > 0 ? (
        <Box mb={4}>
          <Text fontSize="sm" color="#E53E3E" fontWeight="600">
            Ошибки в адресах: {invalidEmails.join(", ")}
          </Text>
          <Text fontSize="xs" color="#E53E3E">
            Можно не удалять их из списка. Добавьте верные адреса для отправки.
          </Text>
        </Box>
      ) : null}
      <Flex justify="end">
        <Button
          bg="#3B6EA0"
          color="white"
          _hover={{ bg: "#2D547B" }}
          rightIcon={<ArrowForwardIcon />}
          borderRadius="12px"
          h="48px"
          px={5}
          fontWeight="600"
          onClick={canSend ? openModal : onAuthClick}
          isDisabled={canSend && recipientsTokens.length === 0}
        >
          {canSend ? "Отправить" : "Авторизоваться для отправки"}
        </Button>
      </Flex>

      <ModalSend
        isOpen={isOpen}
        onClose={handleClose}
        status={status}
        progress={progress}
        onConfirm={handleSend}
        onRetry={handleSend}
        recipientsCount={recipientsCount}
      />
    </Box>
  );
}
