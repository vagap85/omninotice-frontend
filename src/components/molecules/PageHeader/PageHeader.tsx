import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Heading,
  Icon,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { LuHouse } from "react-icons/lu";
import { memo } from "react";
import AccountWidget from "../AccountWidget/AccountWidget";
import type { PageHeaderProps } from "../types/types";

function PageHeader({
  isAuthorized,
  title
}: PageHeaderProps) {

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
            separator={
              <ChevronRightIcon color="#12233F" w={4} h={4} display={"grid"}
                placeItems={"center"} />
            }
            fontSize="12px"
            mb={1}
          >
            <BreadcrumbItem>
              <BreadcrumbLink color="#52525B" href="/">
                <Icon as={LuHouse} boxSize={4} display={"flex"} color={"#52525B"} />
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink _hover={{ textDecoration: "none" }}>
                {title}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <Heading size="md">{title}</Heading>
        </Box>

        {isAuthorized ? (
          <AccountWidget />
        ) : null}
      </Flex>
    </Box>
  );
}
export default memo(PageHeader)