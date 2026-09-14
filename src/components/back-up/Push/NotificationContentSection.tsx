import { memo } from "react";
import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    FormLabel,
    HStack,
    InputGroup,
    InputRightElement,
    Text,
} from "@chakra-ui/react";
import { LuSparkles } from "react-icons/lu";
import type { NotificationContentSectionProps } from "../../types/Push/types";
import CustomInput from "../../atoms/Input/CustomInput";
import CustomTextArea from "../../atoms/TextArea/CustomTextArea";

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
                    <CustomInput
                        id="push-title"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        maxLength={maxLengths.title}
                        placeholder="Например, Вам назначена задача"
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
                    <CustomTextArea
                        id="push-text"
                        value={text}
                        onChange={(e) => onTextChange(e.target.value)}
                        placeholder="Введите текст уведомления"
                        minH="155px"
                        maxLength={maxLengths.text}
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
                        variant={"accent"}
                        leftIcon={<LuSparkles />}
                        color="white"
                        borderRadius="12px"
                        h="40px"
                        px={6}
                        loadingText="Обработка..."
                    >
                        Улучшить текст
                    </Button>
                </HStack>
            </FormControl>
        </Box>
    );
}

export default memo(NotificationContentSection);