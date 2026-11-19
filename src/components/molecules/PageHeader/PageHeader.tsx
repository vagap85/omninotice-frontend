import { ChevronRightIcon } from '@chakra-ui/icons';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Heading,
  Icon
} from '@chakra-ui/react';
import { memo } from 'react';
import { LuHouse } from 'react-icons/lu';

import { AccountWidget } from '../AccountWidget/AccountWidget';
import type { PageHeaderProps } from '../types/types';
import { ROUTES } from '@/routing/routes';

function PageHeader({ isAuthorized, title }: PageHeaderProps) {
  return (
    <Box
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      padding={'16px clamp(24px, 2vw, 40px) 12px'}
    >
      <Flex
        justify="space-between"
        align="center"
        gap={4}
        flexWrap={'wrap'}
      >
        <Box>
          <Breadcrumb
            spacing="8px"
            separator={
              <ChevronRightIcon
                color="#12233F"
                w={4}
                h={4}
                display={'grid'}
                placeItems={'center'}
              />
            }
            fontSize="12px"
            mb={2}
          >
            <BreadcrumbItem>
              <BreadcrumbLink
                color="#52525B"
                href={ROUTES.home}
              >
                <Icon
                  as={LuHouse}
                  boxSize={4}
                  display={'flex'}
                  color={'#52525B'}
                />
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink _hover={{ textDecoration: 'none' }}>
                {title}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <Heading
            size="md"
            lineHeight={'38px'}
          >
            {title}
          </Heading>
        </Box>

        {isAuthorized ? <AccountWidget /> : null}
      </Flex>
    </Box>
  );
}
export default memo(PageHeader);
