import { Flex, Link, Text } from "@chakra-ui/react";

export default function PageHeaderBadge() {
    return (
        <Flex
            minH={{ base: "72px", md: "40px" }}
            bg="#ECF2F8"
            borderRadius="12px"
            align="center"
            justify="center"
            fontSize="14px"
            gap={{ base: 3, md: 2 }}
            textAlign="center"
            px={{ base: 3, md: 4 }}
            py={{ base: 2, md: 0 }}
            direction={{ base: "column", md: "row" }}
        >
            <Text fontWeight="600" lineHeight="20px">
                🎁 Первая рассылка — бесплатно. Без карты и обязательств.
            </Text>
            <Link
                color="#2D547B"
                textDecor="underline"
                fontWeight="400"
                href="/create/email"
                _hover={{ color: "#244869" }}
            >
                Попробовать сейчас
            </Link>
        </Flex>
    )
}
