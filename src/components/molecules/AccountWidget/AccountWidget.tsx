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
import { memo, useEffect, useState } from 'react';
import { LuChevronDown, LuChevronUp, LuLogOut, LuUser } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

import { fetchMyProfile } from '@/api/profile';
import { useAuth } from '@/auth/AuthContext';
import UserIcon from '@/components/atoms/Icons/collections/Sigma/UserIcon';
import LogoutModal from '@/components/organisms/Modals/LogoutModal';
import { ROUTES } from '@/routing/routes';

function AccountWidgetComponent() {
  const {
    isOpen: isLogoutOpen,
    onOpen: onOpenLogout,
    onClose: onCloseLogout
  } = useDisclosure();
  const { logout, authState, updateUser } = useAuth();
  const navigate = useNavigate();
  const [cachedName, setCachedName] = useState(() => {
    const storedProfile = sessionStorage.getItem('profile_data');
    if (!storedProfile) return { firstName: '', lastName: '' };

    try {
      const profile: unknown = JSON.parse(storedProfile);
      if (!profile || typeof profile !== 'object') {
        return { firstName: '', lastName: '' };
      }

      const { firstName, lastName } = profile as Record<string, unknown>;
      return {
        firstName: typeof firstName === 'string' ? firstName.trim() : '',
        lastName: typeof lastName === 'string' ? lastName.trim() : ''
      };
    } catch (error) {
      console.warn('Could not read cached profile name:', error);
      return { firstName: '', lastName: '' };
    }
  });

  useEffect(() => {
    // 1. Sync from sessionStorage if it has name data
    const stored = sessionStorage.getItem('profile_data');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Record<string, unknown>;
        const sFirst =
          typeof parsed.firstName === 'string' ? parsed.firstName.trim() : '';
        const sLast =
          typeof parsed.lastName === 'string' ? parsed.lastName.trim() : '';
        if (sFirst || sLast) {
          setCachedName((prev) => ({
            firstName: sFirst || prev.firstName,
            lastName: sLast || prev.lastName
          }));
          if (
            (sFirst && !authState?.firstName) ||
            (sLast && !authState?.lastName)
          ) {
            updateUser?.({
              ...(sFirst ? { firstName: sFirst } : {}),
              ...(sLast ? { lastName: sLast } : {})
            });
          }
        }
      } catch {
        // ignore parse error
      }
    }

    // 2. If both first and last name are already available, no need to fetch
    const currentFirst = authState?.firstName || cachedName.firstName;
    const currentLast = authState?.lastName || cachedName.lastName;
    if (currentFirst && currentLast) {
      return;
    }

    // 3. Fetch from UserCenter profile API
    let isMounted = true;
    fetchMyProfile()
      .then((profile) => {
        if (!isMounted || !profile) return;
        const fetchedFirst = profile.first_name?.trim() || '';
        const fetchedLast = profile.last_name?.trim() || '';

        if (fetchedFirst || fetchedLast) {
          setCachedName((prev) => ({
            firstName: fetchedFirst || prev.firstName,
            lastName: fetchedLast || prev.lastName
          }));

          updateUser?.({
            ...(fetchedFirst ? { firstName: fetchedFirst } : {}),
            ...(fetchedLast ? { lastName: fetchedLast } : {})
          });

          try {
            const raw = sessionStorage.getItem('profile_data');
            const current = raw
              ? (JSON.parse(raw) as Record<string, unknown>)
              : {};
            sessionStorage.setItem(
              'profile_data',
              JSON.stringify({
                ...current,
                firstName: fetchedFirst || current.firstName || '',
                lastName: fetchedLast || current.lastName || '',
                email:
                  profile.contact_email?.find(
                    (item) =>
                      item.title?.toLowerCase() === 'work' ||
                      item.title?.toLowerCase() === 'рабочий'
                  )?.value ||
                  profile.contact_email?.[0]?.value ||
                  current.email ||
                  authState?.login ||
                  ''
              })
            );
          } catch {
            // ignore storage error
          }
        }
      })
      .catch((error) => {
        console.warn('Could not fetch profile in AccountWidget:', error);
      });

    return () => {
      isMounted = false;
    };
  }, [
    authState?.firstName,
    authState?.lastName,
    authState?.login,
    cachedName.firstName,
    cachedName.lastName,
    updateUser
  ]);

  const displayName =
    [
      authState?.firstName || cachedName.firstName,
      authState?.lastName || cachedName.lastName
    ]
      .filter((name) => name?.trim())
      .join(' ') ||
    authState?.login ||
    '';

  const initials = (() => {
    const first = (authState?.firstName || cachedName.firstName || '').trim();
    const last = (authState?.lastName || cachedName.lastName || '').trim();
    if (first && last) {
      return (first[0] + last[0]).toUpperCase();
    }
    return displayName.trim().slice(0, 2).toUpperCase();
  })();

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
                    {authState?.login}
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
                onClick={() => navigate(ROUTES.profile)}
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
