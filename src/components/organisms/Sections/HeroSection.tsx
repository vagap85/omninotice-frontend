import { Badge, Box, Flex, Heading, HStack, Text, VStack } from "@chakra-ui/react";

import { useAuth } from "@/auth/AuthContext";
import CustomButton from "@/components/atoms/Button/CustomButton";
import LogoCherryIcon from "@/components/atoms/Icons/home/LogoCherryIcon";
import LogoMailIcon from "@/components/atoms/Icons/home/LogoMailIcon";
import LogoMaxIcon from "@/components/atoms/Icons/home/LogoMaxIcon";
import LogoSmsIcon from "@/components/atoms/Icons/home/LogoSmsIcon";
import LogoTelegramIcon from "@/components/atoms/Icons/home/LogoTelegramIcon";
import StatsCursorIcon from "@/components/atoms/Icons/home/StatsCursorIcon";

const channelBadges = [
    { label: "e-mail", href: "/create/email", icon: <LogoMailIcon /> },
    { label: "SMS", href: "", icon: <LogoSmsIcon /> },
    { label: "Telegram", href: "", icon: <LogoTelegramIcon /> },
    { label: "MAX", href: "", icon: <LogoMaxIcon /> },
    { label: "Push-уведомления", href: "/create/push", icon: <LogoCherryIcon /> },
];

export default function HeroSection() {
    const { isAuthorized } = useAuth()
    return (
        <Box as="section">
            <VStack
                maxW={{ base: "328px", md: "736px", xl: "880px" }}
                mx="auto"
                textAlign="center"
                pt={{ base: 20, md: 24, xl: 196 }}
            >
                <Flex
                    gap={3.5}
                    direction={"column"}
                >
                    <Heading
                        as={"h1"}
                        fontSize={{ base: "52px", md: "72px", xl: "82px" }}
                        lineHeight={{ base: "52px", md: "72px", xl: "72px" }}
                        letterSpacing="-1.8px"
                        fontWeight="400"
                    >
                        <Box as="span">Рассылки </Box>
                        <Box
                            as="span"
                            display="inline-block"
                            position="relative"
                            px={{ base: "8px", md: "10px", xl: "14px" }}
                            py={{ base: "1px", md: "2px" }}
                            mx={{ base: "4px", md: "6px" }}
                            verticalAlign="baseline"
                            transform={{ base: "translateY(-3px)", md: "translateY(-4px)" }}
                        >
                            <Box
                                as="span"
                                position="absolute"
                                top="-1px"
                                right="-4px"
                                bottom="-7px"
                                left="-4px"
                                border="2px solid #00C496"
                                borderRadius="2px"
                                pointerEvents="none"
                            />
                            {[
                                { top: "-6px", left: "-9px" },
                                { top: "-6px", right: "-9px" },
                                { bottom: "-12px", left: "-9px" },
                                { bottom: "-12px", right: "-9px" },
                            ].map((dot) => (
                                <Box
                                    key={JSON.stringify(dot)}
                                    as="span"
                                    position="absolute"
                                    boxSize="10px"
                                    border="2px solid #00C496"
                                    borderRadius="full"
                                    bg="#ECF2F8"
                                    pointerEvents="none"
                                    {...dot}
                                />
                            ))}
                            <Box as="span" position="relative" zIndex={1}>
                                с ИИ
                            </Box>
                            <Box
                                position="absolute"
                                right={{ base: "-16px", md: "-31px" }}
                                bottom={{ base: "-22px", md: "-41px" }}
                                w={{ base: "16px", md: "28px" }}
                                h={{ base: "20px", md: "32px" }}
                                pointerEvents="none"
                            >
                                <StatsCursorIcon />
                            </Box>
                        </Box>
                        <br /> для вашего бизнеса
                    </Heading>
                    <Text
                        color="#52525B"
                        fontSize={{ base: "18px", md: "20px" }}
                        lineHeight={{ base: "28px", md: "30px" }}
                    >
                        Создавайте персонализированные рассылки через различные каналы.
                        <br />
                        Автоматизируйте коммуникацию и повышайте конверсию
                    </Text>
                    <HStack
                        spacing={3.5}
                        wrap="wrap"
                        justify="center"
                        maxW={{ base: "290px", md: "none" }}
                    >
                        {channelBadges.map((item) => (
                            <Badge
                                as={"a"}
                                key={item.label}
                                px="11px"
                                py="5px"
                                borderRadius="99px"
                                border="1px solid #E3E3FE"
                                bg="linear-gradient(121deg, rgba(202, 206, 255, 0.1) 0%, rgba(193, 188, 254, 0.1) 100%)"
                                color="#11023B"
                                fontSize="14px"
                                fontWeight="500"
                                lineHeight={5}
                                textTransform="none"
                                _hover={
                                    item.href !== "" ? { bg: "#E2EBF3" } : undefined
                                }
                                href={item.href}
                                pointerEvents={item.href == "" ? "none" : "auto"}
                            >
                                <HStack spacing={2}>
                                    {item.icon}
                                    <Text>{item.label}</Text>
                                </HStack>
                            </Badge>
                        ))}
                    </HStack>
                </Flex>
                <HStack spacing={5} pt={9} flexWrap={"wrap"}>
                    {!isAuthorized &&
                        <CustomButton
                            as={"a"}
                            variant="outline"
                            lineHeight={"1.5em"}
                            maxW={"400px"}
                            px={5}
                            href="/login"
                        >
                            Войти
                        </CustomButton>
                    }
                    <CustomButton
                        as={"a"}
                        lineHeight={"1.5em"}
                        maxW={"400px"}
                        href="/create/email"
                        px={5}
                    >
                        Создать рассылку
                    </CustomButton>
                </HStack>
            </VStack>
        </Box>
    )
}
