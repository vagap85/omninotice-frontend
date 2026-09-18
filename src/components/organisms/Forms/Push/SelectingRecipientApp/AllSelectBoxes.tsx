import { Box, Flex, Text } from "@chakra-ui/react";

import NotificationCard from "./Cards/NotificationCard";
import { useSelectingRecipientApp } from "./hooks/useSelectingRecipientApp";
import AppSelect from "./Selects/AppSelect";
import IconSelect from "./Selects/IconSelect";
import UsersSelectTest from "./Selects/UsersSelect";

export default function AllSelectBoxes() {
    const { selectedApp } = useSelectingRecipientApp()
    return (
        <Box
            as="fieldset"
            display={"flex"}
            flexDirection={"column"}
            gap={3}
        >
            <AppSelect />
            <IconSelect />
            <UsersSelectTest />
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
                    <NotificationCard selectedApp={selectedApp} />
                </Flex>
            )}
        </Box>
    )
}
