import { Box, Flex, Text } from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";
import type { SelectedApp } from "../types/types";
import CloseIcon from "../../../components/Icons/CloseIcon";

export default function NotificationCard({ selectedApp }: { selectedApp: SelectedApp }) {
    const [searchParams] = useSearchParams();
    const SelectedIcon = selectedApp.icon.Icon;

    const title = searchParams.get("title") || "Заголовок";
    const text = searchParams.get("text") || "Описание";
    const buttonText = searchParams.get("buttonText") || "Кнопка";

    return (
        <Box
            boxShadow="0px 0px 1px 0px #0C0C0D4D"
            px={5}
            py={4}
            borderRadius={12}
            position={"relative"}
        >
            <Flex
                alignItems={"start"}
                gap={4}
            >
                <Box
                    display={"grid"}
                    placeItems={"center"}
                    w={14}
                    h={14}
                    borderRadius={"xl"}
                    bg={selectedApp.bgIconColor}
                    flexShrink={0}
                >
                    <Box
                        display={"grid"}
                        placeItems={"center"}
                        w={6}
                        h={6}
                    >
                        <SelectedIcon color={selectedApp.iconColor} />
                    </Box>
                </Box>
                <Box minW={0} flex={1}>
                    <Text
                        color={"#0C151D"}
                        fontSize={"18px"}
                        fontWeight={"medium"}
                        lineHeight={5}
                        mb={1}
                        wordBreak={"break-word"}
                    >
                        {title}
                    </Text>
                    <Text
                        color={"#767A7F"}
                        fontSize={"16px"}
                        lineHeight={5}
                        wordBreak={"break-word"}
                    >
                        {text}
                    </Text>
                    <Box
                        bg={"#487BFE"}
                        py={2}
                        px={4}
                        lineHeight={"20px"}
                        fontSize={"14px"}
                        color={"white"}
                        borderRadius={8}
                        maxW={"fit-content"}
                        mt={3}
                    >
                        {buttonText}
                    </Box>
                </Box>
            </Flex>
            <Flex
                position={"absolute"}
                top={2}
                right={2}
                w={6}
                h={6}
                alignItems={"center"}
                justifyContent={"center"}
            >
                <CloseIcon />
            </Flex>
        </Box>
    )
}