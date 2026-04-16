import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
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
  canImprove: boolean;
  bodyInvalid?: boolean;
}

export default function EmailMainInput({
  title,
  preheader,
  body,
  setTitle,
  setPreheader,
  setBody,
  canImprove,
  bodyInvalid = false,
}: EmailMainInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingImprove, setLoadingImprove] = useState(false);
  const [improvedBody, setImprovedBody] = useState("");


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
        <FormControl isInvalid={bodyInvalid}>
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
            borderWidth="1px"
            borderColor={bodyInvalid ? "#EF4444" : "gray.200"}
            borderRadius="10px"
            fontSize="md"
            _placeholder={{ color: "gray.400" }}
          />
          {bodyInvalid ? (
            <FormErrorMessage mt={1} fontSize="12px">
              Заполните основную часть письма
            </FormErrorMessage>
          ) : null}
          <HStack justify="flex-end" mt={4}>
            <Button
              leftIcon={<LuSparkles />}
              bg={canImprove ? "#00C496" : "gray.300"}
              color="white"
              borderRadius="12px"
              h="40px"
              px={6}
              _hover={canImprove ? { bg: "teal.500" } : {}}
              onClick={handleImproveText}
              isLoading={loadingImprove}
              loadingText="Обработка..."
              isDisabled={!canImprove}
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
