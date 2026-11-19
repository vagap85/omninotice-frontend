import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast
} from '@chakra-ui/react';
import { useState, useEffect, useRef, useCallback } from 'react';

import type { ProgressModalProps } from '@/types/shortener';

export function ProgressModal({
  onClose,
  onCancel,
  onComplete,
  duration = 2400,
  title = 'Загрузка',
  successMessage,
  error,
  onRetry
}: ProgressModalProps) {
  const toast = useToast();
  const [progress, setProgress] = useState(0);
  const isCancelledRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const hasError = Boolean(error);

  // Обработчик отмены — вызывается также по Escape, клику по оверлею
  // и кнопке-крестику (всё это в Chakra Modal идёт через onClose)
  const handleCancel = useCallback(() => {
    isCancelledRef.current = true;
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
    }
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  }, [onClose, onCancel]);

  // Повтор операции — убирает ошибку и перезапускает прогресс
  const handleRetry = useCallback(() => {
    isCancelledRef.current = false;
    if (onRetry) {
      onRetry();
    }
  }, [onRetry]);

  // Анимация прогресса (при ошибке — останавливаем отображение)
  useEffect(() => {
    if (hasError) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return undefined;
    }

    const startTime = Date.now();

    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min((elapsed / duration) * 100, 100);

      setProgress(currentProgress);

      if (currentProgress >= 100) {
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
        }

        // Небольшая задержка на 100%, чтобы пользователь увидел завершение
        timerRef.current = window.setTimeout(() => {
          if (!isCancelledRef.current) {
            if (onComplete) {
              onComplete();
            } else {
              onClose();
            }
            if (successMessage) {
              // Первая строка — заголовок тоста, остальные — описание
              const [toastTitle, toastDescription] =
                successMessage.split('\n');
              toast({
                title: toastTitle,
                description: toastDescription || undefined,
                status: 'success',
                duration: 6000,
                isClosable: true
              });
            }
          }
        }, 300);
      }
    }, 30);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [duration, onClose, onComplete, successMessage, hasError, toast]);

  return (
    <Modal
      isOpen
      onClose={handleCancel}
      isCentered
    >
      <ModalOverlay bg="rgba(15, 23, 42, 0.45)" />
      <ModalContent
        w="440px"
        maxW="calc(100vw - 32px)"
        borderRadius="16px"
        px="28px"
        pt="24px"
        pb="20px"
      >
        <ModalHeader
          fontSize="18px"
          fontWeight="600"
          color="#12233F"
          p={0}
          mb={7}
        >
          {title}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={0}>
          <Box
            w="100%"
            h="11px"
            bg="#eef2f6"
            borderRadius="9999px"
            overflow="hidden"
            mb={7}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <Box
              h="100%"
              w={`${progress}%`}
              borderRadius="9999px"
              bg={hasError ? '#dc2626' : '#00c496'}
              transition="width 0.04s linear"
              backgroundImage="repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.25) 75%, transparent 75%, transparent)"
              backgroundSize="24px 24px"
            />
          </Box>

          {hasError && (
            <Text
              mb={4}
              fontSize="14px"
              lineHeight="1.4"
              color="#ef4444"
            >
              {error}
            </Text>
          )}
        </ModalBody>
        <ModalFooter
          p={0}
          gap={4}
        >
          <Button
            variant="ghost"
            fontSize="14px"
            fontWeight="500"
            color="#12233F"
            _hover={{ bg: '#f4f4f5' }}
            onClick={handleCancel}
          >
            Отмена
          </Button>
          {hasError && (
            <Button
              bg="#3B6EA0"
              color="white"
              fontSize="14px"
              fontWeight="600"
              borderRadius="10px"
              h="40px"
              px={5}
              _hover={{ bg: '#2D547B' }}
              onClick={handleRetry}
            >
              Повторить
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ProgressModal;
