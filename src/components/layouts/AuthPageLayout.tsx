import { ArrowBackIcon } from '@chakra-ui/icons';
import { Box, Button, VStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import authBg from '@/assets/background.jpg';
import logo from '@/assets/logo.svg';
import { ROUTES } from '@/routing/routes';

export function AuthPageLayout({
  children,
  footer
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <Box
      w="100%"
      h="100vh"
      sx={{
        '@supports (height: 100dvh)': { height: '100dvh' },
        scrollbarGutter: 'stable'
      }}
      overflowX="hidden"
      overflowY="scroll"
      px={{ base: 4, sm: 6 }}
      py={{ base: 16, md: 20 }}
      fontFamily="Inter, system-ui, sans-serif"
    >
      <img
        src={authBg}
        alt=""
        aria-hidden="true"
        loading="eager"
        {...{ fetchpriority: 'high' }}
        draggable={false}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          width: '100%',
          height: 'stretch',
          objectFit: 'cover',
          objectPosition: 'center',
          userSelect: 'none',
          pointerEvents: 'none'
        }}
      />
      <Button
        variant="ghost"
        leftIcon={<ArrowBackIcon />}
        color="#2D547B"
        fontWeight="500"
        fontSize="16px"
        onClick={() => navigate(ROUTES.home)}
        position="absolute"
        zIndex={2}
        top={{ base: '24px', md: '80px' }}
        left={{ base: 4, md: '80px' }}
      >
        На главную
      </Button>

      <VStack
        spacing={10}
        position="relative"
        zIndex={1}
        w="100%"
        maxW="460px"
        mx="auto"
        mt="8vh"
      >
        <Box
          as="img"
          src={logo}
          alt="OmniNotice"
          w="220px"
          h="80px"
        />
        <Box
          w="100%"
          bg="white"
          borderRadius="20px"
          boxShadow="0px 0px 1px rgba(25, 24, 27, 0.3), 0px 8px 16px rgba(26, 24, 27, 0.1)"
          p={8}
        >
          {children}
        </Box>
        {footer}
      </VStack>
    </Box>
  );
}
