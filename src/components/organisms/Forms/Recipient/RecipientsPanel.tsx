import { useEffect, useRef, useState } from 'react';
import { Box, Flex, Heading, Text, useToast } from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { FormProvider, useFormsRegistry } from '@/components/molecules/Form/FormContext';
import { isValidEmail } from '@/utils/recipient';
import { FormTextAreaField } from '@/components/molecules/Form/Elements/FormTextAreaField';
import { hasValidRecipient } from '@/components/molecules/Form/validators/domainValidators';
import RecipientsCounter from './RecipientCounter';
import ModalSend from '@/components/organisms/Modals/ModalSend';
import { FormSubmitButton } from '@/components/molecules/Form/Elements/FormSubmitButton';
import { required } from '@/components/molecules/Form/validators/validators';

type SendStatus = 'confirm' | 'loading' | 'error';
type ValidationError = { title: string; description: string };

interface RecipientsPanelProps {
    initialEmails?: string;
    canSend: boolean;
    onAuthClick: () => void;
    // Проверяет форму письма (formId="email") и возвращает ошибку, если что-то не так
    onValidateEmailForm: () => ValidationError | null;
    // Отправка: получает готовые данные письма и список валидных email
    onSend: (validEmails: string[]) => Promise<void>;
}

export default function RecipientsPanel({
    initialEmails,
    canSend,
    onAuthClick,
    onValidateEmailForm,
    onSend,
}: RecipientsPanelProps) {
    const registry = useFormsRegistry();
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<SendStatus>('confirm');
    const [progress, setProgress] = useState(0);
    const toast = useToast();
    const intervalRef = useRef<number | null>(null);

    const clearProgressInterval = () => {
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const startProgress = () => {
        clearProgressInterval();
        setProgress(0);
        let current = 0;
        intervalRef.current = window.setInterval(() => {
            current = Math.min(current + 4, 90);
            setProgress(current);
        }, 120);
    };

    const finishProgress = () => {
        clearProgressInterval();
        setProgress(100);
    };

    const openModal = () => {
        // 1. Проверяем форму письма (formId="email") — снаружи этой панели
        const emailError = onValidateEmailForm();
        if (emailError) {
            return;
        }

        setStatus('confirm');
        setProgress(0);
        setIsOpen(true);
    };

    const handleClose = () => {
        clearProgressInterval();
        setIsOpen(false);
        setStatus('confirm');
        setProgress(0);
    };

    const handleSend = async () => {
        setStatus('loading');
        startProgress();

        const { emails } = registry.getOrCreateStore('recipients').getValues();
        const validEmails: string[] = emails.trim().split(/\s+/).filter(Boolean).filter(isValidEmail);

        try {
            await onSend(validEmails);
            finishProgress();

            setTimeout(() => {
                setIsOpen(false);
                setStatus('confirm');
                setProgress(0);
                toast({
                    position: 'bottom',
                    duration: 4000,
                    isClosable: true,
                    render: () => (
                        <Box bg="#1FAE4B" color="white" px={5} py={4} borderRadius="16px" boxShadow="lg" minW="470px">
                            <Text fontWeight="700" mb={1}>Рассылка успешно отправлена</Text>
                            <Text>Мы отправили письма на {validEmails.length} электронных адресов</Text>
                        </Box>
                    ),
                });
            }, 300);
        } catch (error) {
            clearProgressInterval();
            setProgress(55);
            setStatus('error');
        }
    };

    useEffect(() => clearProgressInterval, []);

    const recipientsStore = registry.getOrCreateStore('recipients');
    const recipientsCount = recipientsStore
        .getValues()
        .emails?.trim()
        .split(/\s+/)
        .filter(Boolean)
        .filter(isValidEmail).length ?? 0;

    return (
        <FormProvider formId="recipients">
            <Box
                as='form'
                maxW="560px"
                w={"full"}
                bg="white"
                px={6}
                py={5}
                borderLeft="1px solid"
                borderColor="gray.200"
                minH="calc(100vh - 73px)"
            >
                <Heading size="md" mb={6}>Настройка рассылки</Heading>

                <FormTextAreaField
                    name="emails"
                    label="Получатели"
                    placeholder="example@mail.com user@yandex.ru client@gmail.com"
                    minH="180px"
                    bg="gray.50"
                    initialValue={initialEmails}
                    validators={[hasValidRecipient(), required()]}
                />
                <Text fontSize="xs" color="gray.500" mb={2} mt={1}>
                    Введите электронные адреса всех получателей через пробел
                </Text>

                <RecipientsCounter />

                <Flex justify="end">
                    <FormSubmitButton
                        bg="#3B6EA0"
                        color="white"
                        _hover={{ bg: '#2D547B' }}
                        rightIcon={<ArrowForwardIcon boxSize={5} />}
                        borderRadius="12px"
                        h="auto"
                        whiteSpace="normal"
                        py={3}
                        px={5}
                        fontWeight="600"
                        onSubmit={canSend ? openModal : onAuthClick}
                        formIds={["email", "recipients"]}
                    >
                        {canSend ? 'Отправить' : 'Авторизоваться для отправки'}
                    </FormSubmitButton>
                </Flex>

                <ModalSend
                    isOpen={isOpen}
                    onClose={handleClose}
                    status={status}
                    progress={progress}
                    onConfirm={handleSend}
                    onRetry={handleSend}
                    recipientsCount={recipientsCount}
                />
            </Box>
        </FormProvider>
    );
}