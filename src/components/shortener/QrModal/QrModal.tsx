import { DownloadIcon } from '@chakra-ui/icons';
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
  Spinner,
  Text,
  useToast
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';

import { getQrCode } from '@/api/shortenerPublic';
import type { QrModalProps } from '@/types/shortener';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function triggerDownload(href: string, filename: string): void {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QrModal({ shortUrl, shortcut, onClose }: QrModalProps) {
  const toast = useToast();
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Загрузка QR (оверлей, Escape и блокировка скролла — штатные возможности
  // Chakra Modal, отдельная обработка не нужна)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const data = await getQrCode(shortcut);
        if (!cancelled) {
          setQrImageUrl(data.qrImageUrl);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          if (import.meta.env.DEV) {
            // TODO: убрать изображение-заглушку когда будет бэкенд
            setQrImageUrl('/qr-example.png');
            setLoading(false);
          } else {
            setLoadError(true);
            setLoading(false);
          }
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [shortcut]);

  const doDownload = async (ext: 'png' | 'svg') => {
    if (!qrImageUrl) return;
    const filename = `qr-${shortcut}.${ext}`;
    setIsDownloading(true);
    try {
      if (qrImageUrl.startsWith('data:')) {
        triggerDownload(qrImageUrl, filename);
      } else {
        const res = await fetch(qrImageUrl);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        triggerDownload(blobUrl, filename);
        URL.revokeObjectURL(blobUrl);
      }
      toast({
        title: `QR-код (${ext.toUpperCase()}) успешно скачан`,
        status: 'success',
        duration: 4000,
        isClosable: true
      });
    } catch {
      triggerDownload(qrImageUrl, filename);
    } finally {
      setIsDownloading(false);
    }
  };

  const canDownload = !loading && !loadError && !isDownloading;

  return (
    <Modal
      isOpen
      onClose={onClose}
      isCentered
    >
      <ModalOverlay bg="rgba(15, 23, 42, 0.45)" />
      <ModalContent
        w="320px"
        borderRadius="12px"
        px={6}
        pt={6}
        pb={5}
      >
        <ModalHeader
          fontSize="16px"
          fontWeight="600"
          color="#12233F"
          p={0}
          mb={5}
        >
          Скачать Qr-код
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody
          p={0}
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <Box
            w="196px"
            h="196px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb={5}
          >
            {loading && <Spinner color="#3b6ea0" size="lg" />}
            {loadError && (
              <Text
                fontSize="13px"
                color="#ef4444"
                textAlign="center"
              >
                Не удалось загрузить QR-код
              </Text>
            )}
            {!loading && !loadError && qrImageUrl && (
              <img
                src={qrImageUrl}
                alt={`QR-код для ${shortUrl}`}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )}
          </Box>
        </ModalBody>
        <ModalFooter
          p={0}
          pt={4}
          w="100%"
          gap={2}
        >
          <Button
            variant="ghost"
            flex={1}
            fontSize="14px"
            fontWeight="500"
            color="#3b5a8a"
            isDisabled={!canDownload}
            _hover={{ bg: '#f4f4f5', color: '#12233f' }}
            rightIcon={<DownloadIcon boxSize={3} />}
            onClick={() => doDownload('png')}
          >
            Скачать PNG
          </Button>
          <Button
            variant="ghost"
            flex={1}
            fontSize="14px"
            fontWeight="500"
            color="#3b5a8a"
            isDisabled={!canDownload}
            _hover={{ bg: '#f4f4f5', color: '#12233f' }}
            rightIcon={<DownloadIcon boxSize={3} />}
            onClick={() => doDownload('svg')}
          >
            Скачать SVG
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default QrModal;
