import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Box,
  Text,
  Flex,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { LuSparkles, LuCheck } from "react-icons/lu";

interface TextVariant {
  id: number;
  title: string;
  preheader: string;
  body: string;
}

interface ImproveTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalVariant: TextVariant;
  improvedVariant: TextVariant;
  onApply: (variant: TextVariant) => void;
}

export default function ImproveTextModal({
  isOpen,
  onClose,
  originalVariant,
  improvedVariant,
  onApply,
}: ImproveTextModalProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<number>(1);

  useEffect(() => {
    if (isOpen) {
      setSelectedVariantId(originalVariant.id);
    }
  }, [isOpen, originalVariant.id]);

  const variants = [originalVariant, improvedVariant];

  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) || originalVariant;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="6xl">
      <ModalOverlay bg="blackAlpha.300" />

      <ModalContent borderRadius="20px" maxW="1000px" bg="#F7F8FC">
        <ModalHeader fontSize="lg" fontWeight="600">
          Варианты по улучшению рассылки
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody>
          <Flex gap={4}>
            {variants.map((variant, index) => {
              const isSelected = selectedVariantId === variant.id;

              return (
                <Box
                  key={variant.id}
                  flex="1"
                  bg={isSelected ? "linear-gradient(180deg, #EFFFFB 0%, #BDF7E8 100%)" : "white"}
                  borderRadius="20px"
                  p={5}
                  minH="400px"
                  maxH="400px"
                  overflowY="auto"
                  cursor="pointer"
                  transition="all 0.2s ease"
                  onClick={() => setSelectedVariantId(variant.id)}
                >
                  <Flex justify="space-between" align="start" mb={6}>
                    <Flex align="center" gap={2}>
                      <Icon as={LuSparkles} color="#00C496" boxSize={5} />
                      <Text fontSize="24px" fontWeight="600" color="#00A67E">
                        Вариант {index + 1}
                      </Text>
                    </Flex>

                    {isSelected && (
                      <Flex
                        align="center"
                        justify="center"
                        w="36px"
                        h="36px"
                        borderRadius="full"
                        bg="#00C496"
                        flexShrink={0}
                      >
                        <Icon as={LuCheck} color="white" boxSize={5} />
                      </Flex>
                    )}
                  </Flex>

                  <VStack align="stretch" spacing={5}>
                    <Box>
                      <Text color="gray.400" fontSize="md" mb={1}>
                        Тема письма
                      </Text>
                      <Text fontSize="md" color="black">
                        {variant.title}
                      </Text>
                    </Box>

                    <Box>
                      <Text color="gray.400" fontSize="md" mb={1}>
                        Предзаголовок
                      </Text>
                      <Text fontSize="md" color="black">
                        {variant.preheader}
                      </Text>
                    </Box>

                    <Box>
                      <Text color="gray.400" fontSize="md" mb={1}>
                        Текст письма
                      </Text>
                      <Text fontSize="md" whiteSpace="pre-line" color="black">
                        {variant.body}
                      </Text>
                    </Box>
                  </VStack>
                </Box>
              );
            })}
          </Flex>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Отмена
          </Button>
          <Button
            bg="black"
            color="white"
            _hover={{ bg: "gray.800" }}
            onClick={() => onApply(selectedVariant)}
          >
            Применить
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}