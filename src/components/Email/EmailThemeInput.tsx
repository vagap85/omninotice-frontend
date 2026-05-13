import {
  Box,
  FormErrorMessage,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  VStack,
} from "@chakra-ui/react";

interface EmailThemeInputProps {
  subject: string;
  preheader: string;
  onSubjectChange: (value: string) => void;
  onPreheaderChange: (value: string) => void;
  subjectInvalid?: boolean;
}

export default function EmailThemeInput({
  subject,
  preheader,
  onSubjectChange,
  onPreheaderChange,
  subjectInvalid = false,
}: EmailThemeInputProps) {
  return (
    <Box bg="gray.100" p={6}>
      <Box bg="white" borderRadius="10px" p={6} maxW="900px" mx="auto">
        <VStack spacing={8} align="stretch">
          <FormControl isInvalid={subjectInvalid}>
            <FormLabel fontSize="lg" mb={3}>
              Тема письма
            </FormLabel>

            <InputGroup>
              <Input
                value={subject}
                onChange={(e) => onSubjectChange(e.target.value)}
                maxLength={70}
                placeholder="Специальное предложение"
                h="44px"
                bg="gray.50"
                borderWidth="1px"
                borderColor={subjectInvalid ? "#EF4444" : "gray.200"}
                borderRadius="10px"
                pr="72px"
                fontSize="md"
                _placeholder={{ color: "gray.400" }}
              />

              <InputRightElement h="44px" w="72px" pointerEvents="none">
                <Text color="gray.400" fontSize="md">
                  {subject.length}/70
                </Text>
              </InputRightElement>
            </InputGroup>

            <FormHelperText mt={2} color="gray.600" fontSize="xs">
              Краткая и понятная тема. Избегайте слов ВСЕМИ ЗАГЛАВНЫМИ.
            </FormHelperText>
            {subjectInvalid ? (
              <FormErrorMessage mt={1} fontSize="12px">
                Заполните тему письма
              </FormErrorMessage>
            ) : null}
          </FormControl>

          <FormControl>
            <FormLabel fontSize="lg" mb={3}>
              Предзаголовок
            </FormLabel>

            <InputGroup>
              <Input
                value={preheader}
                onChange={(e) => onPreheaderChange(e.target.value)}
                maxLength={100}
                placeholder="Открыв письмо, вы получите персональную скидку"
                h="44px"
                bg="gray.50"
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="10px"
                pr="80px"
                fontSize="md"
                _placeholder={{ color: "gray.400" }}
              />

              <InputRightElement h="44px" w="80px" pointerEvents="none">
                <Text color="gray.400" fontSize="md">
                  {preheader.length}/100
                </Text>
              </InputRightElement>
            </InputGroup>

            <FormHelperText mt={2} color="gray.600" fontSize="xs">
              Это короткий текст, который отображается рядом с темой письма в
              почтовом ящике. Не дублируйте тему. Используйте это поле, чтобы
              добавить важное уточнение или призыв к действию.
            </FormHelperText>
          </FormControl>
        </VStack>
      </Box>
    </Box>
  );
}
