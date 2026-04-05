import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  HStack,
} from "@chakra-ui/react";
import { LuSparkles } from "react-icons/lu";
import ImproveTextModal from "../ImproveTextModal";
import { improveText } from "../../api/improveText";

interface EmailMainInputProps {
  title: string;
  preheader: string;
  body: string;
  setTitle: (value: string) => void;
  setPreheader: (value: string) => void;
  setBody: (value: string) => void;
}

export default function EmailMainInput({
  title,
  preheader,
  body,
  setTitle,
  setPreheader,
  setBody,
}: EmailMainInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingImprove, setLoadingImprove] = useState(false);
  const [improvedBody, setImprovedBody] = useState("");


  async function fakeAi(text: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("приветик");
      }, 0);
    });
  }

  const handleImproveText = async () => {
    if (!body.trim()) {
      alert("Введите текст");
      return;
    }

    setLoadingImprove(true);

    try {
      const result = await improveText(body);
      setImprovedBody(result);
      setIsOpen(true);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Ошибка запроса");
    } finally {
      setLoadingImprove(false);
    }
  };

  const originalVariant = {
    id: 1,
    title,
    preheader,
    body,
  };

  const improvedVariant = {
    id: 2,
    title,
    preheader,
    body: improvedBody,
  };

  const handleApply = (variant: {
    id: number;
    title: string;
    preheader: string;
    body: string;
  }) => {
    setTitle(variant.title);
    setPreheader(variant.preheader);
    setBody(variant.body);
    setIsOpen(false);
  };

  return (
    <Box bg="gray.100" p={6}>
      <Box bg="white" borderRadius="10px" p={6} maxW="900px" mx="auto">
        <FormControl>
          <FormLabel fontSize="lg" mb={3}>
            Основная часть письма
          </FormLabel>

          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Введите текст рассылки"
            minH="240px"
            resize="vertical"
            bg="gray.50"
            border="none"
            borderRadius="10px"
            fontSize="md"
            _placeholder={{ color: "gray.400" }}
          />

          <HStack justify="flex-end" mt={4}>
            <Button
              leftIcon={<LuSparkles />}
              bg="#00C496"
              color="white"
              borderRadius="10px"
              px={6}
              _hover={{ bg: "teal.500" }}
              onClick={handleImproveText}
              isLoading={loadingImprove}
              loadingText="Обработка..."
            >
              Улучшить текст
            </Button>
          </HStack>
        </FormControl>
      </Box>

      <ImproveTextModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        originalVariant={originalVariant}
        improvedVariant={improvedVariant}
        onApply={handleApply}
      />
    </Box>
  );
}
