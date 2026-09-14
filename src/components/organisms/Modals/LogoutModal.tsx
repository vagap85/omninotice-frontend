import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text
} from '@chakra-ui/react'
import { LogoutModalProps } from '../types/types'

export default function LogoutModal({
    isOpen,
    logout,
    onClose
}: LogoutModalProps) {
    return (
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
                        onClick={logout}
                    >
                        Выйти
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
