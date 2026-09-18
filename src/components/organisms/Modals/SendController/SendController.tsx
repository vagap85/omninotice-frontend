import { Box, Text, useToast } from '@chakra-ui/react';

import { SendControllerProps } from '../../types/types';
import { useSendProgress } from '../hooks/useSendProgress';
import ModalSend from '../ModalSend';

import { sendMessages } from './messages';


export default function SendController<TPayload>({
    variant,
    isOpen,
    onClose,
    recipientsCount,
    getPayload,
    onSend,
}: SendControllerProps<TPayload>) {
    const toast = useToast();
    const { status, setStatus, progress, start, finish, fail, reset } = useSendProgress();
    const messages = sendMessages[variant];

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSend = async () => {
        setStatus('loading');
        start();

        try {
            await onSend(getPayload());
            finish();

            setTimeout(() => {
                handleClose();
                const { title, description } = messages.successMessage(recipientsCount);
                toast({
                    position: 'bottom',
                    duration: 4000,
                    isClosable: true,
                    render: () => (
                        <Box bg="#1FAE4B" color="white" px={5} py={4} borderRadius="16px" boxShadow="lg" minW="470px">
                            <Text fontWeight="700" mb={1}>{title}</Text>
                            <Text>{description}</Text>
                        </Box>
                    ),
                });
            }, 300);
        } catch (error) {
            fail();
            console.error(error);
        }
    };

    return (
        <ModalSend
            isOpen={isOpen}
            onClose={handleClose}
            status={status}
            progress={progress}
            onConfirm={handleSend}
            onRetry={handleSend}
            confirmMessage={messages.confirmMessage(recipientsCount)}
        />
    );
}