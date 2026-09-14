import { useState } from "react";
import { Box, Flex, IconButton, Radio, RadioGroup, Stack, Text } from "@chakra-ui/react";
import { useSelectingRecipientApp } from "../Providers/SelectingRecipientApp.provider";
import SearchInput from "../Inputs/SearchInput";
import type { RecipientsMode, UsersSelectProps } from "../types/types";
import { useSelectedUsers } from "../Providers/SelectedUsers.provider";
import { CloseIcon } from "@chakra-ui/icons";

const rowStyles = {
    w: "full",
    px: "18px",
    py: 3,
    bg: "#F8FAFC",
    borderRadius: "10px",
    border: "1px solid",
    borderColor: "#E2EBF3",
    cursor: "pointer",
};

const controlStyles = {
    ".chakra-radio__control": {
        borderColor: "#CBD5E1",
        _checked: { bg: "#3B6EA0", borderColor: "#2563EB" },
    },
    "&::before": {
        width: "6px",
        height: "6px",
        transform: "translateX(0.5px)"
    },
    ".chakra-radio__label": {
        marginLeft: "12px",
        fontSize: "md",
        color: "#12233F",
        backgroundColor: "#F8FAFC",
        outline: "1px solid #E2EBF3"
    },
};

export default function UsersSelect({
    value,
    onChange,
}: UsersSelectProps) {
    const { selectedApp } = useSelectingRecipientApp()
    const { selectedUsers, removeUser } = useSelectedUsers()
    const [selectedValue, setSelectedValue] = useState<RecipientsMode>(value !== undefined ? value : "all");

    const handleChange = (next: RecipientsMode) => {
        if (value === undefined) setSelectedValue(next);
        onChange?.(next);
    };

    return (
        <Flex
            direction={"column"}
            gap={1.5}
        >
            <Text fontSize="lg" color="#12233F">
                Получатели
            </Text>

            <RadioGroup value={selectedValue} onChange={handleChange} isDisabled={selectedApp == null}>
                <Stack spacing={2}>
                    <Box
                        bg={"#F8FAFC"}
                        border={"1px solid #E2EBF3"}
                        borderRadius={"10px"}
                    >
                        <Radio value="all" colorScheme="blue" sx={controlStyles} {...rowStyles}>
                            Все пользователи
                        </Radio>
                    </Box>
                    <Box
                        bg={"#F8FAFC"}
                        border={"1px solid #E2EBF3"}
                        borderRadius={"10px"}
                    >
                        <Radio value="individual" fill={"#3B6EA0"} sx={controlStyles} {...rowStyles}>
                            Отдельные пользователи
                        </Radio>
                    </Box>
                </Stack>
            </RadioGroup>
            {selectedValue == "individual" && selectedApp && (
                <SearchInput platform={selectedApp.platform} />
            )
            }
            {selectedUsers && selectedValue == "individual" && (
                <Flex
                    flexWrap={"wrap"}
                    gap={1}
                >
                    {selectedUsers.map(({ id, full_name }) => {
                        return (
                            <Flex
                                key={id}
                                padding={2}
                                gap={2}
                                borderRadius={8}
                                bg={"#F8FAFC"}
                                outline={"0.5px solid #E2EBF3"}
                                alignItems={"center"}
                                transition={"outline 0.2s ease-in, background-color 0.2s ease-in"}
                                _hover={{ bg: "#E2EBF3", outline: "none" }}
                            >
                                <Text
                                    color={"#12233F"}
                                    lineHeight={5}
                                    fontSize={"sm"}
                                >
                                    {full_name}
                                </Text>
                                <IconButton
                                    w={6}
                                    h={6}
                                    aria-label="Удалить пользователя"
                                    icon={<CloseIcon width={2.5} height={2.5} />}
                                    size="xs"
                                    variant="ghost"
                                    color="#A1A1AA"
                                    _hover={{ color: "#EF4444", bg: "transparent" }}
                                    onClick={() => removeUser(id)}
                                />
                            </Flex>
                        )
                    })}
                </Flex>
            )
            }
            {selectedApp && (
                <Text fontSize="md" color="#008F6D" fontWeight="medium" lineHeight={"24px"}>
                    Добавлено получателей: {
                        selectedValue == "all" ? selectedApp?.count : selectedUsers.length ?? "Ошибка получения данных"
                    }
                </Text>
            )}
        </Flex>
    );
}