import { Grid, Heading, HStack, Text, VStack } from "@chakra-ui/react";

import LogoMailIcon from "@/components/atoms/Icons/home/LogoMailIcon";

import TariffCard from "../Cards/TariffCard";
import { TariffCardProps } from "../types/types";

const tariffs: TariffCardProps[] = [
    {
        title: "Пробный",
        subtitle: "попробуй новые возможности прямо сейчас",
        isHighlighted: false,
        features: [
            { text: "10 отправок / мес.", isDisabled: false },
            { text: "5 улучшений текста / мес.", isDisabled: false },
            { text: "Шаблоны писем", isDisabled: false },
            { text: "Отложенные отправки и история уведомлений", isDisabled: true },
            { text: "Обратная связь", isDisabled: true },
        ],
    },
    {
        title: "Базовый",
        subtitle: "для тех, кто хочет начать развивать бизнес",
        isHighlighted: true,
        features: [
            { text: "100 отправок / мес.", isDisabled: false },
            { text: "100 улучшений текста / мес.", isDisabled: false },
            { text: "Шаблоны писем", isDisabled: false },
            { text: "Отложенные отправки и история уведомлений", isDisabled: false },
            { text: "Обратная связь", isDisabled: true },
        ],
    },
    {
        title: "Продвинутый",
        subtitle: "максимум для тех, кто готов выкладываться на полную",
        isHighlighted: false,
        features: [
            { text: "500 отправок / мес.", isDisabled: false },
            { text: "750 улучшений текста / мес.", isDisabled: false },
            { text: "Шаблоны писем", isDisabled: false },
            { text: "Отложенные отправки и история уведомлений", isDisabled: false },
            { text: "Обратная связь", isDisabled: false },
            { text: "Доступ к новому функционалу", isDisabled: false },
        ],
    },
];
export default function TariffsSection() {
    return (
        <VStack
            as="section"
            id="tariffs"
            mt={{ base: 20, md: 28 }}
            spacing={"52px"}
        >
            <Heading
                fontSize={{ base: "40px", md: "56px" }}
                lineHeight={{ base: "48px", md: "64px" }}
                fontWeight="400"
                textAlign="center"
            >
                Тарифы
            </Heading>
            <Grid
                w="100%"
                maxW="1400px"
                mx="auto"
                templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }}
                gap="24px"
                alignItems="center"
            >
                {tariffs.map(({ title, subtitle, features, isHighlighted }) => {
                    return (
                        <TariffCard
                            key={title}
                            title={title}
                            subtitle={subtitle}
                            features={features}
                            isHighlighted={isHighlighted}
                        />
                    )
                })}
            </Grid>
            <VStack
                mt={{ base: 4, md: 14 }}
                spacing={8}
                pb={{ base: 8, md: 12 }}
            >
                <Text
                    textAlign="center"
                    fontSize={{ base: "14px", md: "20px" }}
                    lineHeight={{ base: "22px", md: "28px" }}
                    color="#12233F"
                    fontWeight="400"
                >
                    Для подключения тарифа и по любым вопросам пишите нам на почту:
                </Text>

                <HStack
                    as="a"
                    href="mailto:s@eitica.ru"
                    spacing={2}
                    px={3}
                    py={1.5}
                    borderRadius="99px"
                    border="1px solid #DDD9FF"
                    bg="rgba(255,255,255,0.9)"
                    transition="all 0.2s ease"
                    _hover={{
                        bg: "white",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    }}
                >
                    <LogoMailIcon width={30} height={30} />
                    <Text
                        fontSize={{ base: "18px", md: "28px" }}
                        lineHeight="1"
                        fontWeight="500"
                    >
                        s@eitica.ru
                    </Text>
                </HStack>
            </VStack>
        </VStack>
    )
}
