import { Box, Flex } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface NotificationLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export default function NotificationLayout({
  children,
  sidebar
}: NotificationLayoutProps) {
  return (
    <Flex
      flex="1"
      minW={0}
      minH={'full'}
      bg="#ECF2F8"
    >
      <Flex
        flex="1"
        minW={0}
        flexDirection={{ base: 'column', laptop: 'row' }}
        justifyContent={{base: "unset", laptop: "space-between"}}
      >
        <Box
          flex={{base: "unset", laptop: "1"}}
          minW={0}
        >
          {children}
        </Box>
        <Box
          w={{
            base: 'auto',
            laptop: '360px',
            xxl: '29.17vw'
          }}
          flexShrink={0}
          mx={{
            base: 'clamp(12px, 1.7vw + 0.125rem, 24px)',
            laptop: 0
          }}
          mb={{
            base: 'clamp(12px, 1.7vw + 0.125rem, 24px)',
            laptop: 0
          }}
        >
          {sidebar}
        </Box>
      </Flex>
    </Flex>
  );
}
