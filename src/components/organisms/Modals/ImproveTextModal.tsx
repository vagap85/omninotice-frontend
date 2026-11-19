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
  Icon
} from '@chakra-ui/react';
import { useState } from 'react';
import { LuSparkles, LuCheck } from 'react-icons/lu';

import { ImproveTextModalProps } from '../types/types';

export default function ImproveTextModal({
  isOpen,
  onClose,
  firstVariant,
  secondVariant,
  onApply,
  heading = 'Варианты по улучшению рассылки',
  fields = [
    { key: 'title', label: 'Тема письма' },
    { key: 'preheader', label: 'Предзаголовок' },
    { key: 'body', label: 'Текст письма' }
  ]
}: ImproveTextModalProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<number>(
    firstVariant.id
  );
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Сброс выбора при каждом открытии модалки — без эффекта,
  // через сравнение с предыдущим значением прямо во время рендера
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setSelectedVariantId(firstVariant.id);
    }
  }

  const variants = [firstVariant, secondVariant];

  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ||
    firstVariant;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size="6xl"
    >
      <ModalOverlay bg="blackAlpha.300" />

      <ModalContent
        borderRadius="20px"
        maxW="1000px"
        bg="#F7F8FC"
      >
        <ModalHeader
          fontSize="lg"
          fontWeight="600"
        >
          {heading}
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
                  bg={
                    isSelected
                      ? 'linear-gradient(180deg, #EFFFFB 0%, #BDF7E8 100%)'
                      : 'white'
                  }
                  borderRadius="20px"
                  p={5}
                  minH="400px"
                  maxH="400px"
                  overflowY="auto"
                  cursor="pointer"
                  transition="all 0.2s ease"
                  onClick={() => setSelectedVariantId(variant.id)}
                >
                  <Flex
                    justify="space-between"
                    align="start"
                    mb={6}
                  >
                    <Flex
                      align="center"
                      gap={2}
                    >
                      <Icon
                        as={LuSparkles}
                        color="#00C496"
                        boxSize={5}
                      />
                      <Text
                        fontSize="24px"
                        fontWeight="600"
                        color="#00A67E"
                      >
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
                        <Icon
                          as={LuCheck}
                          color="white"
                          boxSize={5}
                        />
                      </Flex>
                    )}
                  </Flex>

                  <VStack
                    align="stretch"
                    spacing={5}
                  >
                    {fields.map(({ key, label }) => (
                      <Box key={key}>
                        <Text
                          color="gray.400"
                          fontSize="md"
                          mb={1}
                        >
                          {label}
                        </Text>
                        <Text
                          fontSize="md"
                          whiteSpace="pre-line"
                          color="black"
                        >
                          {variant[key]}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              );
            })}
          </Flex>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            mr={3}
            onClick={onClose}
          >
            Отмена
          </Button>
          <Button
            bg="black"
            color="white"
            _hover={{ bg: 'gray.800' }}
            onClick={() => onApply(selectedVariant)}
          >
            Применить
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
