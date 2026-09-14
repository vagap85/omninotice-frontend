import { Box, Button, Flex, Heading } from "@chakra-ui/react";
import SelectingRecipientAppProvider from "./Providers/SelectingRecipientApp.provider";
import AllSelectBoxes from "./AllSelectBoxes";
import { SelectedUsersProvider } from "./Providers/SelectedUsers.provider";
import { memo } from "react";
import { ArrowForwardIcon } from "@chakra-ui/icons/ArrowForward";
import { useNavigate } from "react-router";

function SelectingRecipientApp({ isAuthorized }: { isAuthorized: boolean }) {
    const navigate = useNavigate();

    // Заглушка
    const openModal = () => {
        console.log("Отправка формы");
    }

    const onAuthClick = () => {
        navigate("/login")
    }

    return (
        <SelectingRecipientAppProvider>
            <Box
                maxW={{ base: "360px", xxl: "560px" }}
                w="100%"
                bg="white"
                px={6}
                py={5}
                borderLeft="1px solid"
                borderColor="gray.200"
                minH="calc(100vh - 73px)"
            >
                <Heading size="md" mb={6}>
                    Настройка рассылки
                </Heading>
                <SelectedUsersProvider>
                    <Flex
                        direction={"column"}
                        gap={3}
                    >
                        <AllSelectBoxes />
                        <Button
                            bg="#3B6EA0"
                            color="white"
                            _hover={{ bg: "#2D547B" }}
                            rightIcon={<ArrowForwardIcon />}
                            borderRadius="12px"
                            h="48px"
                            px={5}
                            fontWeight="600"
                            onClick={isAuthorized ? openModal : onAuthClick}
                            maxW={"fit-content"}
                            ml={"auto"}
                            disabled={isAuthorized}
                        >
                            {isAuthorized ? "Отправить" : "Авторизоваться для отправки"}
                        </Button>
                    </Flex>
                </SelectedUsersProvider>
            </Box>
        </SelectingRecipientAppProvider>
    )
}
export default memo(SelectingRecipientApp)