import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  Heading,
  Icon,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { LuHouse } from "react-icons/lu";

interface PageHeaderProps {
  isAuthorized: boolean;
  onLogout: () => void;
}

export default function PageHeader({ isAuthorized, onLogout }: PageHeaderProps) {
  return (
    <Box
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      px={6}
      py={4}
    >
      <Flex justify="space-between" align="center" gap={4}>
        <Box>
          <Breadcrumb
            spacing="8px"
            separator={<ChevronRightIcon color="gray.400" />}
            fontSize="12px"
            color="gray.500"
            mb={1}
          >
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                <Icon as={LuHouse} boxSize={4} />
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink _hover={{ textDecoration: "none" }}>
                Создание e-mail рассылки
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <Heading size="md">Создание e-mail рассылки</Heading>
        </Box>

        {isAuthorized ? (
          <Button
            variant="outline"
            borderColor="#2D547B"
            color="#2D547B"
            borderRadius="16px"
            h="48px"
            minW="104px"
            px={6}
            fontSize="16px"
            lineHeight="24px"
            fontWeight="500"
            onClick={onLogout}
            _hover={{ bg: "#F1F5F9" }}
          >
            Выйти
          </Button>
        ) : null}
      </Flex>
    </Box>
  );
}
