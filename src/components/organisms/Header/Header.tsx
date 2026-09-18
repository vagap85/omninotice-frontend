import { Button, Flex, Grid, GridItem, Icon, useBreakpointValue, useDisclosure } from "@chakra-ui/react";
import { LuLogOut } from "react-icons/lu";

import { useAuth } from "@/auth/AuthContext";
import CustomButton from "@/components/atoms/Button/CustomButton";
import ArrowRightIcon from "@/components/atoms/Icons/home/ArrowRightIcon";
import LogoFigmaIcon from "@/components/atoms/Icons/home/LogoFigmaIcon";

import Navigation from "../../molecules/Navigation/Navigation";
import LogoutModal from "../Modals/LogoutModal";

export default function Header() {
    const iconSize = useBreakpointValue({ base: 12, md: 16 }) ?? 16;
    const buttonText = useBreakpointValue({
        base: "Попробовать",
        sm: "Попробовать бесплатно",
    }) ?? "Попробовать бесплатно";
    const { isAuthorized, logout } = useAuth()
    const { onOpen, isOpen, onClose } = useDisclosure()
    return (
        <>
            <Grid
                as={"header"}
                mt={4}
                alignItems="center"
                gap={
                    {
                        base: "12px",
                        md: "14px 40px"
                    }
                }
                templateAreas={{
                    base: `
                    "logo actions"
                    "nav nav"
                `,
                    lg: `"logo nav actions"`,
                }}
                templateColumns={{
                    base: "110px 1fr",
                    lg: "110px 1fr auto",
                }}
            >
                <GridItem area="logo">
                    <LogoFigmaIcon />
                </GridItem>

                <GridItem
                    area="nav"
                    justifySelf={{ base: "center", lg: "auto" }}
                    w={{ base: "full", md: "unset" }}
                >
                    <Navigation />
                </GridItem>

                <GridItem area="actions">
                    <Flex
                        gap={
                            {
                                base: 1,
                                md: 4
                            }
                        }
                        justifyContent="flex-end"
                        flexWrap={"wrap"}
                    >
                        {isAuthorized
                            ?
                            <CustomButton
                                bg="#E2EBF3"
                                color="#2D547B"
                                borderRadius="10px"
                                h="30px"
                                px={3}
                                fontSize="12px"
                                lineHeight="16px"
                                fontWeight="500"
                                rightIcon={<Icon as={LuLogOut} boxSize={3.5} />}
                                onClick={onOpen}
                                _hover={{ bg: "#D6E3EF" }}
                            >
                                Выйти
                            </CustomButton>
                            : (
                                <Button
                                    as="a"
                                    variant="outline"
                                    href="/login"
                                    fontSize={
                                        {
                                            base: "12px",
                                            md: "sm"
                                        }
                                    }
                                    padding={{
                                        base: "4px 8px",
                                        md: "10px 16px"
                                    }}
                                    minH={"unset"}
                                    lineHeight={
                                        {
                                            base: "12px",
                                            md: "sm"
                                        }
                                    }
                                >
                                    Войти
                                </Button>
                            )
                        }

                        <Button
                            as="a"
                            href="/create/email"
                            rightIcon={<ArrowRightIcon width={iconSize} height={iconSize} />}
                            minH={"unset"}
                            padding={{
                                base: "4px 8px",
                                md: "10px 16px"
                            }}
                            fontSize={
                                {
                                    base: "12px",
                                    md: "sm"
                                }
                            }
                            lineHeight={
                                {
                                    base: "12px",
                                    md: "sm"
                                }
                            }
                        >
                            {buttonText}
                        </Button>
                    </Flex>
                </GridItem>
            </Grid>
            <LogoutModal logout={logout} onClose={onClose} isOpen={isOpen} />
        </>
    );
}