import { ChevronDownIcon } from "@chakra-ui/icons/ChevronDown";
import { Box, Button, Flex, HStack, Icon, Link, Text, VStack } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/auth/AuthContext";
import CustomButton from "@/components/atoms/Button/CustomButton";
import LogoCherryIcon from "@/components/atoms/Icons/home/LogoCherryIcon";
import LogoMailIcon from "@/components/atoms/Icons/home/LogoMailIcon";
import LogoMaxIcon from "@/components/atoms/Icons/home/LogoMaxIcon";
import LogoSmsIcon from "@/components/atoms/Icons/home/LogoSmsIcon";
import LogoTelegramIcon from "@/components/atoms/Icons/home/LogoTelegramIcon";


const submenuItems = [
    { label: "По e-mail", href: "/create/email", hint: "", icon: <LogoMailIcon width={24} height={24} /> },
    { label: "Push", href: "/create/push", hint: "", icon: <LogoCherryIcon width={24} height={24} /> },
    { label: "По смс", href: "", hint: "СКОРО", icon: <LogoSmsIcon width={24} height={24} /> },
    { label: "В телеграм", href: "", hint: "СКОРО", icon: <LogoTelegramIcon width={24} height={24} /> },
    { label: "В MAX", href: "", hint: "СКОРО", icon: <LogoMaxIcon width={24} height={24} /> },
];

export default function Navigation() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const desktopMenuContainerRef = useRef<HTMLDivElement | null>(null);
    const { isAuthorized } = useAuth();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const isInsideDesktop =
                desktopMenuContainerRef.current?.contains(target) ?? false;
            if (!isInsideDesktop) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <HStack
            spacing={
                {
                    base: "4",
                    md: "8"
                }
            }
            fontSize="16px"
            color="#12233F"
            fontWeight="500"
            as="nav"
            display={"flex"}
            flexWrap={"wrap"}
            justifyContent={{ base: "space-between", md: "unset" }}
        >
            <Link
                href="#features"
                fontSize={
                    {
                        base: "12px",
                        md: "md"
                    }
                }
                _hover={{ color: "#2D547B" }}
            >
                Преимущества
            </Link>
            <Link
                href="#tariffs"
                fontSize={
                    {
                        base: "12px",
                        md: "md"
                    }
                }
                _hover={{ color: "#2D547B" }}
            >
                Тарифы
            </Link>
            <Flex ref={desktopMenuContainerRef} position="relative" flexWrap={"wrap"}>
                <Button
                    display={"flex"}
                    variant={"unstyled"}
                    color="#12233F"
                    fontWeight={500}
                    padding={0}
                    cursor="pointer"
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    _hover={{ color: "#2D547B" }}
                    alignItems="center"
                    justifyContent={"flex-start"}
                    gap={2}
                    fontSize={
                        {
                            base: "12px",
                            md: "md"
                        }
                    }
                >
                    <Text lineHeight="24px">Создать рассылку</Text>
                    <Box
                        boxSize="18px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Icon
                            as={ChevronDownIcon}
                            boxSize="16px"
                            color="currentColor"
                            transform={isMenuOpen ? "rotate(180deg)" : "rotate(0deg)"}
                            transition="transform 0.2s ease"
                        />
                    </Box>
                </Button>

                {isMenuOpen ? (
                    <Box
                        position="absolute"
                        top="calc(100% + 10px)"
                        left={{ base: "auto", md: 0 }}
                        right={{ base: 0, md: "auto" }}
                        w="fit-content"
                        bg="white"
                        borderRadius="13px"
                        boxShadow="0 0 0.5px rgba(24,24,27,0.3), 0 8px 8px rgba(24,24,27,0.1)"
                        p={3}
                        zIndex={20}
                    >
                        {submenuItems.map(({ label, hint, icon, href }) => (
                            <CustomButton
                                key={label}
                                as={"a"}
                                href={label == "Push" && !isAuthorized ? "/login" : href}
                                variant={"ghost"}
                                role="link"
                                display="flex"
                                alignItems="center"
                                justifyContent={"flex-start"}
                                gap={3}
                                p={2}
                                borderRadius="10px"
                                opacity={href !== "" ? 1 : 0.6}
                                minW="220px"
                                cursor={href !== "" ? "pointer" : "default"}
                                disabled={href == ""}
                                _hover={href !== "" ? { bg: "#F8FAFC" } : undefined}
                            >
                                <Flex
                                    align="center"
                                    justify="center"
                                    boxSize="44px"
                                    borderRadius="9px"
                                    bg="#ECF2F8"
                                    border="1px solid #E2EBF3"
                                    flexShrink={0}
                                >
                                    {icon}
                                </Flex>
                                <VStack align="start" spacing={0}>
                                    <HStack spacing={2}>
                                        <Text
                                            fontSize="16px"
                                            fontWeight="500"
                                            color="#12233F"
                                        >
                                            {label}
                                        </Text>
                                        {href !== "" ? (
                                            <Box
                                                display={"grid"}
                                                placeItems={"center"}
                                                boxSize={5}
                                            >
                                                <svg preserveAspectRatio="none" width="12" height="12" overflow="visible" viewBox="0 0 13.6667 13.6667" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path id="Vector" d="M1 6.83333H12.6667M12.6667 6.83333L6.83333 1M12.6667 6.83333L6.83333 12.6667" stroke="#3B6EA0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>
                                            </Box>
                                        ) : null}
                                    </HStack>
                                    {hint ? (
                                        <Text variant={"secondary"} fontSize="12px" fontWeight={"400"}>
                                            {hint}
                                        </Text>
                                    ) : null}
                                </VStack>
                            </CustomButton>
                        ))}
                    </Box>
                ) : null}
            </Flex>
        </HStack >
    )
}
