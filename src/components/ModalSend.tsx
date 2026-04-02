import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Text,
  Box,
} from "@chakra-ui/react";

type SendStatus = "confirm" | "loading" | "error";

interface ModalSendProps {
  isOpen: boolean;
  onClose: () => void;
  status: SendStatus;
  progress: number;
  onConfirm: () => Promise<void>;
  onRetry: () => Promise<void>;
  recipientsCount: number;
}

export default function ModalSend({
  isOpen,
  onClose,
  status,
  progress,
  onConfirm,
  onRetry,
  recipientsCount,
}: ModalSendProps) {
  const progressColor = status === "error" ? "#EF4444" : "teal.400";

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay bg="blackAlpha.300" />

      <ModalContent
        w="560px"
        maxW="560px"
        minH="220px"
        borderRadius="24px"
        px={6}
        py={4}
      >
        <ModalHeader fontSize="2xl" fontWeight="700" px={0} pt={2} pb={2}>
          {status === "confirm"
            ? "Подтверждение отправки"
            : "Отправляем рассылку"}
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody px={0} pt={4}>
          {status === "confirm" && (
            <Text fontSize="lg">Отправить {recipientsCount} писем?</Text>
          )}

          {(status === "loading" || status === "error") && (
            <>
              <Box mt={2}>
                <Box
                  h="12px"
                  w="100%"
                  bg="gray.100"
                  borderRadius="sm"
                  overflow="hidden"
                >
                  <Box
                    h="100%"
                    w={`${progress}%`}
                    bg={progressColor}
                    transition="width 0.2s ease"
                    backgroundImage="repeating-linear-gradient(45deg, rgba(255,255,255,0.22), rgba(255,255,255,0.22) 8px, transparent 8px, transparent 16px)"
                  />
                </Box>
              </Box>

              {status === "error" && (
                <Text fontSize="md" color="#EF4444" mt={6}>
                  При отправке произошла ошибка
                </Text>
              )}
            </>
          )}
        </ModalBody>

        <ModalFooter px={0} pt={6}>
          {status === "confirm" && (
            <>
              <Button variant="outline" mr={3} onClick={onClose}>
                Отмена
              </Button>
              <Button
                bg="black"
                color="white"
                _hover={{ bg: "gray.800" }}
                onClick={onConfirm}
              >
                Отправить
              </Button>
            </>
          )}

          {status === "loading" && (
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
          )}

          {status === "error" && (
            <>
              <Button variant="outline" mr={3} onClick={onClose}>
                Отмена
              </Button>
              <Button
                bg="black"
                color="white"
                _hover={{ bg: "gray.800" }}
                onClick={onRetry}
              >
                Повторить
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
