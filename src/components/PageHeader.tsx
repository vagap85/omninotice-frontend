import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
  Icon,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { LuHouse } from "react-icons/lu";

export default function PageHeader() {
  return (
    <Box
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      px={6}
      py={4}
    >
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
  );
}
