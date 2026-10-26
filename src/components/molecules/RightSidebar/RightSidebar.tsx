import { Box, Heading } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface RightSidebarProps {
  title: string;
  children?: ReactNode;
}

export default function RightSidebar({ title, children }: RightSidebarProps) {
  return (
    <Box
      as="form"
      maxW={{
        base: 'unset',
        notification: '360px',
        xxl: '29.17vw'
      }}
      p={'20px 24px'}
      w="full"
      bg="white"
      borderLeft="1px solid"
      borderColor="gray.200"
      minH={{ base: 'unset', notification: '100%' }}
      borderRadius={{ base: '10px', notification: 'none' }}
    >
      <Heading
        size="md"
        mb={6}
      >
        {title}
      </Heading>
      {children}
    </Box>
  );
}
