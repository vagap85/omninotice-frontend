import { Box, Flex, Text } from "@chakra-ui/react";
import AppSelect from "./Selects/AppSelect";
import IconSelect from "./Selects/IconSelect";
import UsersSelect from "./Selects/UsersSelect";
import { useSelectingRecipientApp } from "./Providers/SelectingRecipientApp.provider";
import NotificationCard from "./Cards/NotificationCard";

export default function AllSelectBoxes() {
    const { selectedApp } = useSelectingRecipientApp()
    return (
        <Box
            display={"flex"}
            flexDirection={"column"}
            gap={3}
        >
            <AppSelect />
            <IconSelect />
            <UsersSelect />
            {selectedApp && (
                <Flex
                    direction={"column"}
                    gap={1.5}
                >
                    <Text
                        fontSize="lg"
                        color="#12233F"
                    >
                        Как получатель увидит уведомление
                    </Text>
                    <NotificationCard selectedApp={selectedApp}/>
                </Flex>
            )}
        </Box>
    )
}
