import { memo } from "react";
import {
    Box,
    FormControl,
    FormHelperText,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    Text,
} from "@chakra-ui/react";
import type { ActionSectionProps } from "../../types/Push/types";

function ActionSection({
    buttonText,
    onButtonTextChange,
    buttonLink,
    onButtonLinkChange,
    isLinkValid,
}: ActionSectionProps) {
    const maxLengths = {
        buttonText: 18,
        buttonLink: 30
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
                    Действие
                </FormLabel>

                <FormLabel htmlFor="btn-text" fontSize="md" mb={2}>
                    Текст кнопки
                </FormLabel>
                <InputGroup>
                    <Input
                        id="btn-text"
                        value={buttonText}
                        onChange={(e) => onButtonTextChange(e.target.value)}
                        maxLength={maxLengths.buttonText}
                        placeholder="Например, перейти на сайт"
                        h="44px"
                        bg="gray.50"
                        borderWidth="1px"
                        borderColor={buttonText.length <= maxLengths.buttonText ? "gray.200" : "#EF4444"}
                        borderRadius="10px"
                        pr="72px"
                        fontSize="md"
                        _placeholder={{ color: "gray.400" }}
                        _focusVisible={{ borderColor: buttonText.length <= maxLengths.buttonText ? "inherit" : "#EF4444" }}
                        _hover={{ borderColor: buttonText.length <= maxLengths.buttonText ? "inherit" : "#EF4444" }}
                    />
                    <InputRightElement h="44px" w="72px" pointerEvents="none">
                        <Text color={buttonText.length <= maxLengths.buttonText ? "gray.400" : "#EF4444"} fontSize="md">
                            {buttonText.length}/{maxLengths.buttonText}
                        </Text>
                    </InputRightElement>
                </InputGroup>
                {buttonText.length <= maxLengths.buttonText ? (
                    <FormHelperText mt={2} color="gray.600" fontSize="xs">
                        Кнопка в конце письма с призывом к действию
                    </FormHelperText>
                ) : (
                    <FormHelperText mt={2} color="#EF4444" fontSize="xs">
                        Превышено количество знаков. Уберите лишние, чтобы отправить.
                    </FormHelperText>
                )}

                <FormLabel htmlFor="btn-link" fontSize="md" mt={4} mb={2}>
                    Ссылка для кнопки
                </FormLabel>
                <InputGroup>
                    <Input
                        id="btn-link"
                        value={buttonLink}
                        onChange={(e) => onButtonLinkChange(e.target.value)}
                        placeholder="Вставьте ссылку"
                        maxLength={maxLengths.buttonLink}
                        h="44px"
                        bg="gray.50"
                        borderWidth="1px"
                        borderColor={isLinkValid || buttonLink.length > maxLengths.buttonLink ? "gray.200" : "#EF4444"}
                        borderRadius="10px"
                        fontSize="md"
                        _placeholder={{ color: "gray.400" }}
                        _focusVisible={{ borderColor: isLinkValid || buttonLink.length > maxLengths.buttonLink ? "gray.200" : "#EF4444" }}
                        _hover={{ borderColor: isLinkValid || buttonLink.length > maxLengths.buttonLink ? "gray.200" : "#EF4444" }}
                    />
                    <InputRightElement h="44px" w="72px" pointerEvents="none">
                        <Text color={buttonLink.length <= maxLengths.buttonLink ? "gray.400" : "#EF4444"} fontSize="md">
                            {buttonLink.length}/{maxLengths.buttonLink}
                        </Text>
                    </InputRightElement>
                </InputGroup>
                {!isLinkValid && (
                    <FormHelperText mt={2} color="#EF4444" fontSize="xs">
                        Укажите валидный URL в формате http(s)://...
                    </FormHelperText>
                )}
                {buttonLink.length > maxLengths.buttonLink && (
                    <FormHelperText mt={2} color="#EF4444" fontSize="xs">
                        Превышено количество знаков. Уберите лишние, чтобы отправить.
                    </FormHelperText>
                )}
            </FormControl>
        </Box>
    );
}

export default memo(ActionSection);