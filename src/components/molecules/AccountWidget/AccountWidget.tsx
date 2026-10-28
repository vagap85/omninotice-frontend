import {
  Box,
  Flex,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
  VStack
} from '@chakra-ui/react';
import { memo, useMemo } from 'react';
import { LuChevronDown, LuChevronUp, LuLogOut, LuUser } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/auth/AuthContext';
import UserIcon from '@/components/atoms/Icons/collections/Sigma/UserIcon';
import LogoutModal from '@/components/organisms/Modals/LogoutModal';

const getInitials = (
  firstName?: string,
  lastName?: string,
  login?: string
): string => {
  const first = firstName?.trim();
  const last = lastName?.trim();

  if (first && last) {
    return `${first[0]}${last[0]}`.toUpperCase();
  }

  if (first || last) {
    const name = (first ?? last)!;
    return name.slice(0, 2).toUpperCase();
  }

  if (login?.trim()) {
    return login.trim().slice(0, 2).toUpperCase();
  }

  return '';
};

function AccountWidgetComponent() {
  const {
    isOpen: isLogoutOpen,
    onOpen: onOpenLogout,
    onClose: onCloseLogout
  } = useDisclosure();
  const { logout, authState } = useAuth();
  const navigate = useNavigate();

  const storedProfile = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('profile_data');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const firstName =
    authState?.firstName?.trim() || storedProfile?.firstName?.trim() || 'Иван';
  const lastName =
    authState?.lastName?.trim() || storedProfile?.lastName?.trim() || 'Иванов';
  const email =
    authState?.login?.trim() || storedProfile?.email?.trim() || 'mail@mail.ru';

  const fullName = `${firstName} ${lastName}`.trim();
  const displayName = fullName || firstName || email;
  const initials = getInitials(firstName, lastName, email);

  return (
    <>
      <Menu
        placement="bottom-end"
        gutter={8}
      >
        {({ isOpen }) => (
          <>
            <MenuButton
              as={Box}
              role="button"
              tabIndex={0}
              cursor="pointer"
              display="inline-flex"
              alignItems="center"
              p="4px 8px"
              borderRadius="10px"
              transition="background 0.15s"
              _hover={{ bg: '#F8FAFC' }}
              _expanded={{ bg: '#F8FAFC' }}
            >
              <HStack
                spacing={3}
                align="center"
              >
                <Flex
                  boxSize="40px"
                  borderRadius="full"
                  bg="#3B6EA0"
                  color="white"
                  align="center"
                  justify="center"
                  fontSize="14px"
                  fontWeight="600"
                  flexShrink={0}
                >
                  {initials === '' ? (
                    <UserIcon
                      width={18}
                      height={18}
                    />
                  ) : (
                    initials
                  )}
                </Flex>
                <VStack
                  spacing={0}
                  align="start"
                >
                  <Text
                    fontSize="15px"
                    lineHeight="1.25"
                    fontWeight="600"
                    color="#12233F"
                  >
                    {displayName}
                  </Text>
                  <Text
                    fontSize="13px"
                    lineHeight="1.25"
                    fontWeight="400"
                    color="#52525B"
                    mt="2px"
                  >
                    {email}
                  </Text>
                </VStack>
                <Icon
                  as={isOpen ? LuChevronUp : LuChevronDown}
                  boxSize="18px"
                  color="#12233F"
                  ml={2}
                />
              </HStack>
            </MenuButton>

            <MenuList
              bg="white"
              border="1px solid"
              borderColor="#E2EBF3"
              borderRadius="12px"
              boxShadow="0px 4px 16px rgba(18, 35, 63, 0.08)"
              p="6px"
              minW="220px"
              zIndex={1000}
            >
              <MenuItem
                onClick={() => navigate('/profile')}
                borderRadius="8px"
                px="14px"
                py="10px"
                bg="transparent"
                _hover={{ bg: '#F8FAFC' }}
                _focus={{ bg: '#F8FAFC' }}
              >
                <HStack spacing="12px">
                  <Icon
                    as={LuUser}
                    boxSize="18px"
                    color="#12233F"
                  />
                  <Text
                    fontSize="14px"
                    fontWeight="500"
                    color="#12233F"
                  >
                    Настройки профиля
                  </Text>
                </HStack>
              </MenuItem>
              <MenuItem
                onClick={onOpenLogout}
                borderRadius="8px"
                px="14px"
                py="10px"
                bg="transparent"
                _hover={{ bg: '#F8FAFC' }}
                _focus={{ bg: '#F8FAFC' }}
              >
                <HStack spacing="12px">
                  <Icon
                    as={LuLogOut}
                    boxSize="18px"
                    color="#12233F"
                  />
                  <Text
                    fontSize="14px"
                    fontWeight="500"
                    color="#12233F"
                  >
                    Выйти
                  </Text>
                </HStack>
              </MenuItem>
            </MenuList>
          </>
        )}
      </Menu>

      <LogoutModal
        logout={logout}
        onClose={onCloseLogout}
        isOpen={isLogoutOpen}
      />
    </>
  );
}

export const AccountWidget = memo(AccountWidgetComponent);
