import { Box, Container } from "@chakra-ui/react";

import PageHeaderBadge from "@/components/molecules/PageHeaderBadgeLanding/PageHeaderBadge";
import Header from "@/components/organisms/Header/Header";
import FeaturesSection from "@/components/organisms/Sections/FeaturesSection";
import HeroSection from "@/components/organisms/Sections/HeroSection";
import TariffsSection from "@/components/organisms/Sections/TariffsSection";

// TODO: Исправить ошибку показа цветового фона сзади Hero и других элементов
export default function HomePage() {
  return (
    <Box minH="100vh" bg="white" color="#12233F">
      <Container
        maxW="1760px"
        px={{ base: 4, md: 6, xl: 8 }}
        py={5}
        position="relative"
      >
        <PageHeaderBadge />
        <Header />
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
          top={"-300px"}
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
        <Container
          maxW="1760px"
          px={{ base: 4, md: 8 }}
          position="relative"
          zIndex={1}
        >
          <HeroSection />
          <FeaturesSection />
          <TariffsSection />
        </Container>
      </Box>
    </Box>
  );
}
