import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  Textarea,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { LuSparkles } from "react-icons/lu";
import ImproveTextModal from "../ImproveTextModal";
import { improveText } from "../../api/improveText";

interface EmailMainInputProps {
  title: string;
  preheader: string;
  body: string;
  signature: string;
  actionText: string;
  actionLink: string;
  setTitle: (value: string) => void;
  setPreheader: (value: string) => void;
  setBody: (value: string) => void;
  setSignature: (value: string) => void;
  setActionText: (value: string) => void;
  setActionLink: (value: string) => void;
  canImprove: boolean;
  bodyInvalid?: boolean;
  titleInvalid?: boolean;
}

export default function EmailMainInput({
  title,
  preheader,
  body,
  signature,
  actionText,
  actionLink,
  setTitle,
  setPreheader,
  setBody,
  setSignature,
  setActionText,
  setActionLink,
  canImprove,
  bodyInvalid = false,
  titleInvalid = false,
}: EmailMainInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingImprove, setLoadingImprove] = useState(false);

  const [improvedBody, setImprovedBody] = useState("");
  const [improvedTitle, setImprovedTitle] = useState("");
  const [improvedDescription, setImprovedDescription] = useState("");

  const [improvedBodySecond, setImprovedBodySecond] = useState("");
  const [improvedTitleSecond, setImprovedTitleSecond] = useState("");
  const [improvedDescriptionSecond, setImprovedDescriptionSecond] =
    useState("");

  const handleImproveText = async () => {
    if (!body.trim()) {
      alert("Введите текст");
      return;
    }

    setLoadingImprove(true);

    try {
      const { answerFirst, answerSecond } = await improveText(body);
      setImprovedTitle(answerFirst.title);
      setImprovedBody(answerFirst.text);
      setImprovedDescription(answerFirst.description);

      setImprovedTitleSecond(answerSecond.title);
      setImprovedBodySecond(answerSecond.text);
      setImprovedDescriptionSecond(answerSecond.description);
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
    title: improvedTitleSecond,
    preheader: improvedDescription,
    body: improvedBodySecond,
  };

  const improvedVariant = {
    id: 2,
    title: improvedTitle,
    preheader: improvedDescriptionSecond,
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
      <VStack spacing={3} align="stretch" maxW="900px" mx="auto">
        <Box bg="white" borderRadius="10px" p={6}>
          <Text
            fontSize="24px"
            lineHeight="32px"
            fontWeight="600"
            color="#12233F"
            mb={4}
          >
            Текст письма
          </Text>

          <FormControl isInvalid={titleInvalid}>
            <FormLabel fontSize="md" mb={2}>
              Заголовок письма
            </FormLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Добрый день! Подготовили для вас специальное предложение"
              h="44px"
              bg="gray.50"
              borderWidth="1px"
              borderColor={titleInvalid ? "#EF4444" : "gray.200"}
              borderRadius="10px"
              fontSize="md"
              mb={1}
              _placeholder={{ color: "gray.400" }}
            />
          </FormControl>
          <Text mt={0} mb={4} color="gray.600" fontSize="xs">
            Начало текста письма, будет отображаться более крупно и заметно
          </Text>

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
          </FormControl>

          <FormLabel fontSize="lg" mt={5} mb={3}>
            Подпись
          </FormLabel>
          <Textarea
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Здесь можно указать название компании и контакты для обратной связи"
            minH="120px"
            resize="vertical"
            bg="gray.50"
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="10px"
            fontSize="md"
            _placeholder={{ color: "gray.400" }}
          />

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
        </Box>

        <Box bg="white" borderRadius="10px" p={6}>
          <FormControl>
            <FormLabel
              fontSize="26px"
              lineHeight="32px"
              fontWeight="600"
              color="#12233F"
              mb={4}
            >
              Действие
            </FormLabel>

            <FormLabel fontSize="md" mb={2}>
              Текст кнопки
            </FormLabel>
            <InputGroup>
              <Input
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                maxLength={30}
                placeholder="Например, перейти на сайт"
                h="44px"
                bg="gray.50"
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="10px"
                pr="72px"
                fontSize="md"
                _placeholder={{ color: "gray.400" }}
              />
              <InputRightElement h="44px" w="72px" pointerEvents="none">
                <Text color="gray.400" fontSize="md">
                  {actionText.length}/30
                </Text>
              </InputRightElement>
            </InputGroup>
            <FormHelperText mt={2} color="gray.600" fontSize="xs">
              Кнопка в конце письма с призывом к действию
            </FormHelperText>

            <FormLabel fontSize="md" mt={4} mb={2}>
              Ссылка для кнопки
            </FormLabel>
            <Input
              value={actionLink}
              onChange={(e) => setActionLink(e.target.value)}
              placeholder="Вставьте ссылку"
              h="44px"
              bg="gray.50"
              borderWidth="1px"
              borderColor="gray.200"
              borderRadius="10px"
              fontSize="md"
              _placeholder={{ color: "gray.400" }}
            />
          </FormControl>
        </Box>
      </VStack>

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
