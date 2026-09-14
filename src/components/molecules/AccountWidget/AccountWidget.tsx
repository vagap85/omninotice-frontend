import { useAuth } from '@/auth/AuthContext';
import CustomButton from '@/components/atoms/Button/CustomButton'
import UserIcon from '@/components/atoms/Icons/collections/Sigma/UserIcon';
import LogoutModal from '@/components/organisms/Modals/LogoutModal';
import {
    Flex,
    HStack,
    Icon,
    Text, 
    useDisclosure,
    VStack
} from '@chakra-ui/react'
import { LuLogOut } from 'react-icons/lu'

const getInitials = (firstName?: string, lastName?: string, login?: string): string => {
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

    return "";
};

export default function AccountWidget() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { logout, authState } = useAuth()
    const firstName = authState?.firstName ?? ""
    const lastName = authState?.lastName ?? ""
    const userName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : authState?.login;
    const initials = getInitials(authState?.firstName, authState?.lastName, authState?.login);
    return (
        <>
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
                        {initials == "" ? <UserIcon width={15} height={14}/> : initials}
                    </Flex>
                    <VStack spacing={0} align="start">
                        <Text fontSize="13px" lineHeight="18px" fontWeight="500" color="#1E293B">
                            {userName}
                        </Text>
                    </VStack>
                </HStack>
                <CustomButton
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
                </CustomButton>
            </HStack>

            <LogoutModal logout={logout} onClose={onClose} isOpen={isOpen} />
        </>
    )
}
