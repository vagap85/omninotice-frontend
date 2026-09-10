import { memo } from "react";
import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    FormLabel,
    HStack,
    Input,
    InputGroup,
    InputRightElement,
    Text,
    Textarea,
} from "@chakra-ui/react";
import { LuSparkles } from "react-icons/lu";
import type { NotificationContentSectionProps } from "../types/Push/types";

function NotificationContentSection({
    title,
    onTitleChange,
    text,
    onTextChange,
}: NotificationContentSectionProps) {
    const maxLengths = {
        title: 19,
        text: 155
    }

    return (
        <Box bg="white" borderRadius="10px" p={6}>
            <FormControl>
                <FormLabel
                    fontSize="26px"
                    lineHeight="32px"
                    fontWeight="600"
                    color="#12233F"
                    mb={4}
                >
                    Текст уведомления
                </FormLabel>

                <FormLabel htmlFor="push-title" fontSize="md" mb={2}>
                    Заголовок уведомления
                </FormLabel>
                <InputGroup>
                    <Input
                        id="push-title"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        maxLength={maxLengths.title}
                        placeholder="Например, Вам назначена задача"
                        h="44px"
                        bg="gray.50"
                        borderWidth="1px"
                        borderColor={title.length <= maxLengths.title ? "gray.200" : "#EF4444"}
                        borderRadius="10px"
                        pr="72px"
                        fontSize="md"
                        _placeholder={{ color: "gray.400" }}
                        _focusVisible={{ borderColor: title.length <= maxLengths.title ? "inherit" : "#EF4444" }}
                        _hover={{ borderColor: text.length <= maxLengths.text ? "inherit" : "#EF4444" }}
                    />
                    <InputRightElement h="44px" w="72px" pointerEvents="none">
                        <Text color={title.length <= maxLengths.title ? "gray.400" : "#EF4444"} fontSize="md">
                            {title.length}/{maxLengths.title}
                        </Text>
                    </InputRightElement>
                </InputGroup>
                {title.length <= maxLengths.title ? (
                    <FormHelperText mt={2} color="gray.600" fontSize="xs">
                        Отображается первой строкой в ленте уведомлений более крупно и заметно
                    </FormHelperText>
                ) : (
                    <FormHelperText mt={2} color="#EF4444" fontSize="xs">
                        Превышено количество знаков. Уберите лишние, чтобы отправить.
                    </FormHelperText>
                )}

                <FormLabel htmlFor="push-text" fontSize="md" mt={4} mb={2}>
                    Текст уведомления
                </FormLabel>
                <InputGroup>
                    <Textarea
                        id="push-text"
                        value={text}
                        onChange={(e) => onTextChange(e.target.value)}
                        placeholder="Введите текст уведомления"
                        minH="155px"
                        bg="gray.50"
                        borderWidth="1px"
                        borderColor={text.length <= maxLengths.text ? "gray.200" : "#EF4444"}
                        borderRadius="10px"
                        fontSize="md"
                        _placeholder={{ color: "gray.400" }}
                        maxLength={maxLengths.text}
                        paddingRight={"70px"}
                        py={2.5}
                        _focusVisible={{ borderColor: text.length <= maxLengths.text ? "inherit" : "#EF4444" }}
                        _hover={{ borderColor: text.length <= maxLengths.text ? "inherit" : "#EF4444" }}
                    />
                    <InputRightElement h="44px" w="72px" pointerEvents="none">
                        <Text color={text.length <= maxLengths.text ? "gray.400" : "#EF4444"} fontSize="md">
                            {text.length}/{maxLengths.text}
                        </Text>
                    </InputRightElement>
                </InputGroup>
                {text.length > maxLengths.text && (
                    <FormHelperText mt={2} color="#EF4444" fontSize="xs">
                        Превышено количество знаков. Уберите лишние, чтобы отправить.
                    </FormHelperText>
                )}
                <HStack justify="flex-end" mt={4}>
                    <Button
                        leftIcon={<LuSparkles />}
                        color="white"
                        borderRadius="12px"
                        h="40px"
                        px={6}
                        loadingText="Обработка..."
                        pointerEvents={"none"}
                    >
                        Улучшить текст
                    </Button>
                </HStack>
            </FormControl>
        </Box>
    );
}

export default memo(NotificationContentSection);