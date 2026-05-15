import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  HStack,
  Icon,
  Image,
  Link,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/home/logo-figma.svg";
import arrowRight from "../assets/home/arrow-right.svg";
import badgeMail from "../assets/home/icon-mail.svg";
import badgeSms from "../assets/home/icon-sms.svg";
import badgeTelegram from "../assets/home/icon-telegram.svg";
import badgeMax from "../assets/home/icon-max.svg";
import cardHeart from "../assets/home/card-heart.svg";
import cardTrending from "../assets/home/card-trending.svg";
import cardZap from "../assets/home/card-zap.svg";
import cardLayers from "../assets/home/card-layers.svg";
import cardMonitor from "../assets/home/card-monitor.svg";
import cardUser from "../assets/home/card-user.svg";
import statsCursor from "../assets/home/stats-cursor.svg";
import mail from "../assets/home/mail.svg";

type FeatureCard = {
  title: string;
  description: string;
  icon: string;
};

type PricingPlan = {
  title: string;
  subtitle: string;
  features: string[];
  disabledFeatures?: string[];
  highlighted?: boolean;
};

const pricingPlans: PricingPlan[] = [
  {
    title: "Пробный",
    subtitle: "попробуй новые возможности прямо сейчас",
    features: [
      "10 отправок / мес.",
      "5 улучшений текста / мес.",
      "Шаблоны писем",
    ],
    disabledFeatures: [
      "Отложенные отправки и история уведомлений",
      "Обратная связь",
    ],
  },
  {
    title: "Базовый",
    subtitle: "для тех, кто хочет начать развивать бизнес",
    highlighted: true,
    features: [
      "100 отправок / мес.",
      "100 улучшений текста / мес.",
      "Шаблоны писем",
      "Отложенные отправки и история уведомлений",
    ],
    disabledFeatures: ["Обратная связь"],
  },
  {
    title: "Продвинутый",
    subtitle: "максимум для тех, кто готов выкладываться на полную",
    features: [
      "500 отправок / мес.",
      "750 улучшений текста / мес.",
      "Шаблоны писем",
      "Отложенные отправки и история уведомлений",
      "Обратная связь",
      "Доступ к новому функционалу",
    ],
  },
];

const featureCards: FeatureCard[] = [
  {
    title: "Увеличение лояльности клиентов",
    description:
      "Создаем более глубокую связь с аудиторией и помогаем повысить уровень их лояльности",
    icon: cardHeart,
  },
  {
    title: "Рост конверсии на 30-40%",
    description:
      "Благодаря персонализированным и целенаправленным коммуникациям",
    icon: cardTrending,
  },
  {
    title: "Автоматизация процессов",
    description: "Сокращаем время на выполнение рутинных задач",
    icon: cardZap,
  },
  {
    title: "Единая история взаимодействий",
    description: "Объединяем все контакты клиентов с брендом в одном месте",
    icon: cardLayers,
  },
  {
    title: "Аналитика в реальном времени",
    description:
      "Позволяет мгновенно отслеживать эффективность кампаний, адаптируя стратегию",
    icon: cardMonitor,
  },
  {
    title: "Персонализация коммуникаций",
    description:
      "Увеличиваем вовлеченность клиентов, адаптируя сообщения под их интересы",
    icon: cardUser,
  },
];

const channelBadges = [
  { label: "e-mail", icon: badgeMail },
  { label: "SMS", icon: badgeSms },
  { label: "Telegram", icon: badgeTelegram },
  { label: "MAX", icon: badgeMax },
];

const submenuItems = [
  { label: "По e-mail", hint: "", icon: badgeMail },
  { label: "По смс", hint: "СКОРО", icon: badgeSms },
  { label: "В телеграм", hint: "СКОРО", icon: badgeTelegram },
  { label: "В MAX", hint: "СКОРО", icon: badgeMax },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mobileMenuContainerRef = useRef<HTMLDivElement | null>(null);
  const desktopMenuContainerRef = useRef<HTMLDivElement | null>(null);
  const featuresSectionRef = useRef<HTMLDivElement | null>(null);
  const tariffSectionRef = useRef<HTMLDivElement | null>(null);

  const handleScrollToFeatures = () => {
    const section = featuresSectionRef.current;
    if (!section) return;

    const sectionTop = window.scrollY + section.getBoundingClientRect().top;
    const maxScrollTop =
      document.documentElement.scrollHeight - window.innerHeight;
    const targetScrollTop = Math.min(sectionTop, maxScrollTop);

    window.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: "smooth",
    });
  };

  const handleScrollToTariffs = () => {
    const section = tariffSectionRef.current;
    if (!section) return;

    const sectionTop = window.scrollY + section.getBoundingClientRect().top;
    const maxScrollTop =
      document.documentElement.scrollHeight - window.innerHeight;
    const targetScrollTop = Math.min(sectionTop, maxScrollTop);

    window.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideMobile =
        mobileMenuContainerRef.current?.contains(target) ?? false;
      const isInsideDesktop =
        desktopMenuContainerRef.current?.contains(target) ?? false;
      if (!isInsideMobile && !isInsideDesktop) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Box minH="100vh" bg="white" color="#12233F">
      <Container
        maxW="1760px"
        px={{ base: 4, md: 6, xl: 8 }}
        py={5}
        position="relative"
      >
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
            onClick={() => navigate("/create")}
            _hover={{ color: "#244869" }}
          >
            Попробовать сейчас
          </Link>
        </Flex>

        <VStack
          mt={4}
          spacing={{ base: 3, md: 4 }}
          align="stretch"
          display={{ base: "flex", lg: "none" }}
        >
          <Flex align="center" justify="space-between" gap={3}>
            <Image
              src={logo}
              alt="OmniNotice"
              w="110px"
              h="40px"
              objectFit="contain"
            />
            <HStack spacing={{ base: 1, md: 5 }}>
              <Button
                variant="outline"
                borderColor="#2D547B"
                color="#2D547B"
                borderRadius={{ base: "8px", md: "12px" }}
                h={{ base: "24px", md: "40px" }}
                px={{ base: 2, md: 4 }}
                minW={{ base: "56px", md: "auto" }}
                fontSize={{ base: "12px", md: "14px" }}
                lineHeight={{ base: "16px", md: "20px" }}
                onClick={() => navigate("/login")}
                _hover={{ bg: "#E2EBF3" }}
              >
                Войти
              </Button>
              <Button
                bg="#2D547B"
                color="white"
                borderRadius={{ base: "8px", md: "12px" }}
                h={{ base: "24px", md: "40px" }}
                px={{ base: 2, md: 4 }}
                minW={{ base: "94px", md: "auto" }}
                fontSize={{ base: "12px", md: "14px" }}
                lineHeight={{ base: "16px", md: "20px" }}
                rightIcon={
                  <Image
                    src={arrowRight}
                    alt=""
                    boxSize={{ base: "14px", md: "16px" }}
                  />
                }
                iconSpacing={{ base: 1, md: 2 }}
                _hover={{ bg: "#244869" }}
                onClick={() => navigate("/create")}
              >
                <Text display={{ base: "none", sm: "inline" }}>
                  Попробовать бесплатно
                </Text>
                <Text display={{ base: "inline", sm: "none" }}>
                  Попробовать
                </Text>
              </Button>
            </HStack>
          </Flex>

          <HStack
            spacing={{ base: 4, md: 8, lg: 8 }}
            fontSize={{ base: "12px", md: "16px" }}
            color="#12233F"
            fontWeight="500"
            justify={{ base: "space-between", md: "center", lg: "flex-start" }}
          >
            <Text
              cursor="pointer"
              _hover={{ color: "#2D547B" }}
              onClick={handleScrollToFeatures}
            >
              Преимущества
            </Text>
            <Text
              cursor="pointer"
              _hover={{ color: "#2D547B" }}
              onClick={handleScrollToTariffs}
            >
              Тарифы
            </Text>
            <Box ref={mobileMenuContainerRef} position="relative">
              <HStack
                spacing={0}
                color="#12233F"
                cursor="pointer"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                _hover={{ color: "#2D547B" }}
                w={{ base: "auto", md: "174px" }}
                h="24px"
                align="center"
              >
                <Text
                  w={{ base: "auto", md: "148px" }}
                  h="24px"
                  display="flex"
                  alignItems="center"
                  lineHeight="24px"
                >
                  Создать рассылку
                </Text>
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
              </HStack>

              {isMenuOpen ? (
                <Box
                  position="absolute"
                  top="calc(100% + 10px)"
                  left={{ base: "auto", md: 0 }}
                  right={{ base: 0, md: "auto" }}
                  w={{
                    base: "min(260px, calc(100vw - 32px))",
                    md: "fit-content",
                  }}
                  maxW={{ base: "calc(100vw - 32px)", md: "none" }}
                  bg="white"
                  borderRadius="13px"
                  boxShadow="0 0 0.5px rgba(24,24,27,0.3), 0 8px 8px rgba(24,24,27,0.1)"
                  p={3}
                  zIndex={20}
                >
                  {submenuItems.map(({ label, hint, icon }, idx) => (
                    <Flex
                      key={label}
                      align="center"
                      gap={3}
                      p={2}
                      borderRadius="10px"
                      opacity={idx === 0 ? 1 : 0.6}
                      minW={{ base: "unset", md: "220px" }}
                      w={{ base: "100%", md: "auto" }}
                      cursor={idx === 0 ? "pointer" : "default"}
                      _hover={idx === 0 ? { bg: "#F8FAFC" } : undefined}
                      onClick={() => {
                        if (idx === 0) {
                          navigate("/create");
                          setIsMenuOpen(false);
                        }
                      }}
                    >
                      <Flex
                        align="center"
                        justify="center"
                        boxSize="44px"
                        borderRadius="9px"
                        bg="#ECF2F8"
                        border="1px solid #E2EBF3"
                      >
                        <Image
                          src={icon}
                          alt=""
                          boxSize="24px"
                          objectFit="contain"
                        />
                      </Flex>
                      <VStack align="start" spacing={0}>
                        <HStack spacing={2}>
                          <Text
                            fontSize={{ base: "14px", md: "16px" }}
                            fontWeight="500"
                            color="#12233F"
                          >
                            {label}
                          </Text>
                          {idx === 0 ? <Text color="#2D547B">→</Text> : null}
                        </HStack>
                        {hint ? (
                          <Text
                            fontSize={{ base: "11px", md: "12px" }}
                            color="#52525B"
                          >
                            {hint}
                          </Text>
                        ) : null}
                      </VStack>
                    </Flex>
                  ))}
                </Box>
              ) : null}
            </Box>
          </HStack>
        </VStack>

        <Flex
          mt={4}
          align="center"
          justify="space-between"
          gap={6}
          display={{ base: "none", lg: "flex" }}
        >
          <HStack spacing={10} minW={0}>
            <Image
              src={logo}
              alt="OmniNotice"
              w="110px"
              h="40px"
              objectFit="contain"
            />
            <HStack
              spacing={8}
              fontSize="16px"
              color="#12233F"
              fontWeight="500"
            >
              <Text
                cursor="pointer"
                _hover={{ color: "#2D547B" }}
                onClick={handleScrollToFeatures}
              >
                Преимущества
              </Text>
              <Text
                cursor="pointer"
                _hover={{ color: "#2D547B" }}
                onClick={handleScrollToTariffs}
              >
                Тарифы
              </Text>
              <Box ref={desktopMenuContainerRef} position="relative">
                <HStack
                  spacing={0}
                  color="#12233F"
                  cursor="pointer"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  _hover={{ color: "#2D547B" }}
                  w="174px"
                  h="24px"
                  align="center"
                >
                  <Text
                    w="148px"
                    h="24px"
                    display="flex"
                    alignItems="center"
                    lineHeight="24px"
                  >
                    Создать рассылку
                  </Text>
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
                </HStack>

                {isMenuOpen ? (
                  <Box
                    position="absolute"
                    top="calc(100% + 10px)"
                    left={0}
                    w="fit-content"
                    bg="white"
                    borderRadius="13px"
                    boxShadow="0 0 0.5px rgba(24,24,27,0.3), 0 8px 8px rgba(24,24,27,0.1)"
                    p={3}
                    zIndex={20}
                  >
                    {submenuItems.map(({ label, hint, icon }, idx) => (
                      <Flex
                        key={label}
                        align="center"
                        gap={3}
                        p={2}
                        borderRadius="10px"
                        opacity={idx === 0 ? 1 : 0.6}
                        minW="220px"
                        cursor={idx === 0 ? "pointer" : "default"}
                        _hover={idx === 0 ? { bg: "#F8FAFC" } : undefined}
                        onClick={() => {
                          if (idx === 0) {
                            navigate("/create");
                            setIsMenuOpen(false);
                          }
                        }}
                      >
                        <Flex
                          align="center"
                          justify="center"
                          boxSize="44px"
                          borderRadius="9px"
                          bg="#ECF2F8"
                          border="1px solid #E2EBF3"
                        >
                          <Image
                            src={icon}
                            alt=""
                            boxSize="24px"
                            objectFit="contain"
                          />
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
                            {idx === 0 ? <Text color="#2D547B">→</Text> : null}
                          </HStack>
                          {hint ? (
                            <Text fontSize="12px" color="#52525B">
                              {hint}
                            </Text>
                          ) : null}
                        </VStack>
                      </Flex>
                    ))}
                  </Box>
                ) : null}
              </Box>
            </HStack>
          </HStack>

          <HStack spacing={5} flexShrink={0}>
            <Button
              variant="outline"
              borderColor="#2D547B"
              color="#2D547B"
              borderRadius="12px"
              h="40px"
              px={4}
              fontSize="14px"
              lineHeight="20px"
              onClick={() => navigate("/login")}
              _hover={{ bg: "#E2EBF3" }}
            >
              Войти
            </Button>
            <Button
              bg="#2D547B"
              color="white"
              borderRadius="12px"
              h="40px"
              px={4}
              fontSize="14px"
              lineHeight="20px"
              rightIcon={<Image src={arrowRight} alt="" boxSize="16px" />}
              iconSpacing={2}
              _hover={{ bg: "#244869" }}
              onClick={() => navigate("/create")}
            >
              Попробовать бесплатно
            </Button>
          </HStack>
        </Flex>
      </Container>

      <Box
        mt={{ base: 10, lg: 6 }}
        pb={{ base: 16, lg: 20 }}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          inset={0}
          bg="linear-gradient(180deg, #FFFFFF 0%, #DFF6FF 75%, #DFF6FF 100%)"
          zIndex={0}
        />
        <Box
          position="absolute"
          left="-420px"
          top="260px"
          w="900px"
          h="900px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(178,236,255,0.6) 0%, rgba(223,246,255,0) 70%)"
          zIndex={0}
        />
        <Box
          position="absolute"
          right="-460px"
          top="220px"
          w="980px"
          h="980px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(183,227,255,0.55) 0%, rgba(223,246,255,0) 72%)"
          zIndex={0}
        />
        <Container maxW="1760px" px={{ base: 4, md: 8 }}>
          <VStack
            spacing={5}
            maxW={{ base: "328px", md: "736px", xl: "880px" }}
            mx="auto"
            textAlign="center"
            pt={{ base: 20, md: 24, xl: 40 }}
            position="relative"
            zIndex={1}
          >
            <Text
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
                <Image
                  src={statsCursor}
                  alt=""
                  position="absolute"
                  right={{ base: "-16px", md: "-31px" }}
                  bottom={{ base: "-22px", md: "-41px" }}
                  w={{ base: "16px", md: "28px" }}
                  h={{ base: "20px", md: "32px" }}
                  pointerEvents="none"
                />
              </Box>
              <br /> для вашего бизнеса
            </Text>
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
                  key={item.label}
                  px="11px"
                  py="5px"
                  borderRadius="99px"
                  border="1px solid #E3E3FE"
                  bg="linear-gradient(121deg, rgba(202, 206, 255, 0.1) 0%, rgba(193, 188, 254, 0.1) 100%)"
                  color="#11023B"
                  fontSize="14px"
                  fontWeight="500"
                  textTransform="none"
                  cursor={item.label === "e-mail" ? "pointer" : "default"}
                  _hover={
                    item.label === "e-mail" ? { bg: "#E2EBF3" } : undefined
                  }
                  onClick={() => {
                    if (item.label === "e-mail") {
                      navigate("/create");
                    }
                  }}
                >
                  <HStack spacing={2}>
                    <Image
                      src={item.icon}
                      alt=""
                      boxSize="20px"
                      objectFit="contain"
                    />
                    <Text>{item.label}</Text>
                  </HStack>
                </Badge>
              ))}
            </HStack>

            <HStack spacing={5} pt={2}>
              <Button
                variant="outline"
                borderColor="#2D547B"
                color="#2D547B"
                borderRadius="12px"
                h="44px"
                px={5}
                onClick={() => navigate("/login")}
                _hover={{ bg: "#E2EBF3" }}
              >
                Войти
              </Button>
              <Button
                bg="#2D547B"
                color="white"
                borderRadius="12px"
                h="44px"
                px={5}
                _hover={{ bg: "#244869" }}
                onClick={() => navigate("/create")}
              >
                Создать рассылку
              </Button>
            </HStack>
          </VStack>

          <Grid
            ref={featuresSectionRef}
            mt={{ base: 12, md: 20 }}
            maxW={{ base: "328px", md: "736px", xl: "1400px" }}
            mx="auto"
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              xl: "repeat(3, 1fr)",
            }}
            gap="20px"
            position="relative"
            zIndex={1}
          >
            {featureCards.map((card) => (
              <Box
                key={card.title}
                bg="white"
                border="1px solid #E2EBF3"
                borderRadius="24px"
                p={6}
              >
                <Image
                  src={card.icon}
                  alt=""
                  boxSize="32px"
                  objectFit="contain"
                />
                <Stack spacing={2} mt={6}>
                  <Text
                    fontSize="20px"
                    lineHeight="30px"
                    fontWeight="600"
                    color="#12233F"
                  >
                    {card.title}
                  </Text>
                  <Text fontSize="16px" lineHeight="24px" color="#52525B">
                    {card.description}
                  </Text>
                </Stack>
              </Box>
            ))}
          </Grid>
          <VStack
            ref={tariffSectionRef}
            mt={{ base: 20, md: 28 }}
            spacing={12}
            position="relative"
            zIndex={1}
          >
            <Text
              fontSize={{ base: "40px", md: "56px" }}
              lineHeight={{ base: "48px", md: "64px" }}
              fontWeight="400"
              color="#12233F"
              textAlign="center"
            >
              Тарифы
            </Text>

            <Grid
              w="100%"
              maxW="1400px"
              mx="auto"
              templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }}
              gap="24px"
              alignItems="center"
            >
              {pricingPlans.map((plan) => {
                const isHighlighted = plan.highlighted;

                return (
                  <Box
                    key={plan.title}
                    borderRadius="24px"
                    border={isHighlighted ? "none" : "1px solid #DCE3EA"}
                    bg={isHighlighted ? "#3F73A8" : "#F7F7F8"}
                    color={isHighlighted ? "white" : "#12233F"}
                    p={{ base: 6, md: 8 }}
                    minH={isHighlighted ? "560px" : "520px"}
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                    boxShadow={
                      isHighlighted
                        ? "0 12px 40px rgba(63,115,168,0.25)"
                        : "none"
                    }
                  >
                    <VStack align="start" spacing={6}>
                      <VStack align="center" spacing={1} w="100%">
                        <Text
                          fontSize="36px"
                          lineHeight="42px"
                          fontWeight="500"
                          textAlign="center"
                        >
                          {plan.title}
                        </Text>

                        <Text
                          fontSize="14px"
                          color={
                            isHighlighted ? "rgba(255,255,255,0.8)" : "#6B7280"
                          }
                        >
                          {plan.subtitle}
                        </Text>
                      </VStack>

                      <VStack align="start" spacing={4}>
                        {plan.features.map((feature) => (
                          <HStack key={feature} align="start" spacing={3}>
                            <Box
                              mt="5px"
                              boxSize="14px"
                              borderRadius="4px"
                              bg="#22C55E"
                              color="white"
                              fontSize="10px"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              flexShrink={0}
                            >
                              ✓
                            </Box>

                            <Text fontSize="16px" lineHeight="24px">
                              {feature}
                            </Text>
                          </HStack>
                        ))}

                        {plan.disabledFeatures?.map((feature) => (
                          <Text
                            key={feature}
                            fontSize="16px"
                            lineHeight="24px"
                            color={
                              isHighlighted
                                ? "rgba(255,255,255,0.45)"
                                : "#9CA3AF"
                            }
                            textDecor="line-through"
                          >
                            {feature}
                          </Text>
                        ))}
                      </VStack>
                    </VStack>

                    <Button
                      mt={10}
                      w="100%"
                      h="48px"
                      borderRadius="12px"
                      bg={isHighlighted ? "white" : "#3F73A8"}
                      color={isHighlighted ? "#3F73A8" : "white"}
                      _hover={{
                        opacity: 0.9,
                      }}
                      onClick={() => navigate("/create")}
                    >
                      Узнать больше
                    </Button>
                  </Box>
                );
              })}
            </Grid>
          </VStack>
          <VStack
            mt={{ base: 12, md: 16 }}
            spacing={4}
            pb={{ base: 8, md: 12 }}
            position="relative"
            zIndex={1}
          >
            <Text
              textAlign="center"
              fontSize={{ base: "14px", md: "18px" }}
              lineHeight={{ base: "22px", md: "28px" }}
              color="#12233F"
              fontWeight="400"
            >
              Для подключения тарифа и по любым вопросам пишите нам на почту:
            </Text>

            <Link href="mailto:s@eitica.ru" _hover={{ textDecor: "none" }}>
              <HStack
                spacing={2}
                px={4}
                py={2}
                borderRadius="99px"
                border="1px solid #DDD9FF"
                bg="rgba(255,255,255,0.9)"
                transition="all 0.2s ease"
                _hover={{
                  bg: "white",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
              >
                <Image src={mail} alt="" objectFit="contain"></Image>

                <Text
                  fontSize={{ base: "18px", md: "28px" }}
                  lineHeight="1"
                  color="#221B4F"
                  fontWeight="500"
                >
                  s@eitica.ru
                </Text>
              </HStack>
            </Link>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}
