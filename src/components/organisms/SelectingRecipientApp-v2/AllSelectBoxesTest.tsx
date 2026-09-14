import { Box, Flex, Text } from "@chakra-ui/react";
import AppSelect from "./Selects/AppSelectTest";
import IconSelect from "./Selects/IconSelectTest";
import NotificationCard from "./Cards/NotificationCard";
import UsersSelectTest from "./Selects/UsersSelectTest";
import { useSelectingRecipientAppTest } from "./Providers/SelectingRecipientAppTest.provider";

export default function AllSelectBoxes() {
    const { selectedApp } = useSelectingRecipientAppTest()
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
                    <NotificationCard selectedApp={selectedApp}/>
                </Flex>
            )}
        </Box>
    )
}
