import { Button, Flex, Grid, Modal, ModalContent, ModalOverlay, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { SelectedAppIcon } from "../SelectingRecipientApp-v2/types/types";
import { useSelectingRecipientAppTest } from "../SelectingRecipientApp-v2/Providers/SelectingRecipientAppTest.provider";

interface SelectIconModalProps {
    isOpen: boolean;
    onClose: () => void;
    icons: SelectedAppIcon[];
}

export default function SelectIconModal({ isOpen, onClose, icons }: SelectIconModalProps) {
    const { selectedApp, setSelectedIcon } = useSelectingRecipientAppTest();
    const [draftIcon, setDraftIcon] = useState<SelectedAppIcon | null>(null);
    const filteredIcons = icons.filter((icon) => icon.id !== "0")

    useEffect(() => {
        if (!isOpen) return;
        setDraftIcon(selectedApp?.icon ?? icons[0] ?? null);
    }, [isOpen, selectedApp, icons]);

    const handleApply = () => {
        if (draftIcon) {
            setSelectedIcon(draftIcon);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay bg="rgba(0, 0, 0, 0.25)" />
            <ModalContent
                containerProps={{
                    justifyContent: "flex-end",
                    alignItems: "center",
                }}
                m={0}
                mr={{ base: 4, xxl: 6 }}
                ml={4}
                w="auto"
                maxW="calc(100vw - 32px)"
                borderRadius="16px"
                p={5}
                boxShadow="0 8px 24px rgba(18, 35, 63, 0.12)"
            >
                <Flex direction="column" gap={4}>
                    <Flex direction="column" gap={1}>
                        <Text color="#12233F" fontSize="md" fontWeight="medium" lineHeight="24px">
                            Иконка уведомления
                        </Text>
                        <Text color="#A1A1AA" fontSize="xs" lineHeight="16px">
                            Выберите иконку, подходящую по смыслу уведомления
                        </Text>
                    </Flex>
                    <Grid
                        gridTemplateColumns="repeat(5, minmax(80px, 1fr))"
                        gap={3}
                    >
                        {filteredIcons.map((icon) => {
                            const { Icon, title } = icon;
                            const isSelected = draftIcon?.title === title;

                            return (
                                <Flex
                                    as="button"
                                    type="button"
                                    direction="column"
                                    gap={1}
                                    key={title}
                                    alignItems="center"
                                    onClick={() => setDraftIcon(icon)}
                                    cursor="pointer"
                                    bg={isSelected ? "#E2EBF3" : "#F8FAFC"}
                                    border={"1px solid #E2EBF3"}
                                    borderRadius={10}
                                    padding={3}
                                    _hover={{ bg: "#E2EBF3", borderColor: "#E2EBF3" }}
                                    _focusVisible={{ bg: "#E2EBF3", borderColor: "#E2EBF3" }}
                                >
                                    <Flex
                                        alignItems="center"
                                        justifyContent="center"
                                        flexShrink={0}
                                        padding={2}
                                        h="38px"
                                        w="38px"
                                        bg={selectedApp?.bgIconColor}
                                        borderRadius={6}
                                    >
                                        <Icon color={selectedApp?.iconColor} />
                                    </Flex>
                                    <Text color="#12233F" lineHeight="14px" fontSize="2xs" fontWeight={"medium"}>
                                        {title}
                                    </Text>
                                </Flex>
                            )
                        })}
                    </Grid>
                    <Flex gap={3} justifyContent="flex-end">
                        <Button
                            variant="ghost"
                            h="auto"
                            py={2}
                            px={2.5}
                            lineHeight="16px"
                            fontSize="xs"
                            fontWeight="medium"
                            onClick={onClose}
                            color={"#12233F"}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="solid"
                            h="auto"
                            py={2}
                            px={2.5}
                            lineHeight="16px"
                            fontSize="xs"
                            fontWeight="medium"
                            onClick={handleApply}
                            isDisabled={!draftIcon}
                            borderRadius={8}
                            bg={"#3B6EA0"}
                            color={"white"}
                            _hover={{ bg: "#34608C" }}
                        >
                            Применить
                        </Button>
                    </Flex>
                </Flex>
            </ModalContent>
        </Modal>
    )
}
