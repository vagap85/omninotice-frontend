import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { LuHouse } from "react-icons/lu";
import { LuLogOut } from "react-icons/lu";

interface PageHeaderProps {
  isAuthorized: boolean;
  onLogout: () => void;
  userName?: string;
}

const getInitials = (name?: string): string => {
  if (!name) return "ИИ";
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "ИИ";
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
};

export default function PageHeader({
  isAuthorized,
  onLogout,
  userName = "mail@mail.ru",
}: PageHeaderProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleConfirmLogout = () => {
    onLogout();
    onClose();
  };

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
          <HStack spacing={4}>
            <HStack spacing={2}>
              <Flex
                boxSize="28px"
                borderRadius="full"
                bg="#3B6EA0"
                color="white"
                align="center"
                justify="center"
                fontSize="11px"
                fontWeight="600"
              >
                {getInitials(userName)}
              </Flex>
              <VStack spacing={0} align="start">
                <Text fontSize="13px" lineHeight="18px" fontWeight="500" color="#1E293B">
                  {userName}
                </Text>
              </VStack>
            </HStack>
            <Button
              bg="#E2EBF3"
              color="#2D547B"
              borderRadius="10px"
              h="30px"
              px={3}
              fontSize="12px"
              lineHeight="16px"
              fontWeight="500"
              rightIcon={<Icon as={LuLogOut} boxSize={3.5} />}
              onClick={onOpen}
              _hover={{ bg: "#D6E3EF" }}
            >
              Выйти
            </Button>
          </HStack>
        ) : null}
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="rgba(15, 23, 42, 0.45)" />
        <ModalContent maxW="476px" borderRadius="12px">
          <ModalHeader fontSize="24px" lineHeight="32px" fontWeight="600" color="#12233F" pb={2}>
            Подтверждение действия
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pt={0}>
            <Text color="#52525B" fontSize="16px" lineHeight="24px">
              Вы действительно хотите выйти из аккаунта?
            </Text>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" color="#12233F" onClick={onClose}>
              Отмена
            </Button>
            <Button
              bg="#3B6EA0"
              color="white"
              borderRadius="10px"
              px={5}
              h="40px"
              _hover={{ bg: "#2D547B" }}
              onClick={handleConfirmLogout}
            >
              Выйти
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
