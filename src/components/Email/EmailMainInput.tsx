import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  HStack,
} from "@chakra-ui/react";
import { LuSparkles } from "react-icons/lu";

interface EmailMainInputProps {
  body: string;
  onBodyChange: (value: string) => void;
}

export default function EmailMainInput({ body, onBodyChange }: EmailMainInputProps) {
  const handleImproveText = () => {
    console.log("Текст письма:", body);
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
            onChange={(e) => onBodyChange(e.target.value)}
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
              h="44px"
              _hover={{ bg: "teal.500" }}
              onClick={handleImproveText}
            >
              Улучшить текст
            </Button>
          </HStack>
        </FormControl>
      </Box>
    </Box>
  );
}
