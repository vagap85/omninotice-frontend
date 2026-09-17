import { ArrowForwardIcon } from '@chakra-ui/icons';
import { Box, Flex, Heading, Text, useDisclosure } from '@chakra-ui/react';

import { FormSubmitButton } from '@/components/molecules/Form/Elements/FormSubmitButton';
import { FormTextAreaField } from '@/components/molecules/Form/Elements/FormTextAreaField';
import { useFormsRegistry } from '@/components/molecules/Form/hooks/useFormsRegistry';
import { FormProvider } from '@/components/molecules/Form/Providers/FormProvider';
import { hasValidRecipient } from '@/components/molecules/Form/validators/domainValidators';
import { required } from '@/components/molecules/Form/validators/validators';
import SendController from '@/components/organisms/Modals/SendController/SendController';
import type { RecipientsPanelProps } from '@/components/organisms/types/types';
import { RecipientsFormValues } from '@/pages/types/types';
import { isValidEmail } from '@/utils/recipient';

import RecipientsCounter from './RecipientCounter';

export default function RecipientsPanel({
    initialEmails,
    canSend,
    onAuthClick,
    onValidateEmailForm,
    onSend,
}: RecipientsPanelProps) {
    const registry = useFormsRegistry();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const getValidEmails = () => {
        const { emails } = registry.getOrCreateStore('recipients').getValues<RecipientsFormValues>();
        return (emails ?? '').trim().split(/\s+/).filter(Boolean).filter(isValidEmail);
    };

    const recipientsCount = getValidEmails().length;

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
                        isAuthorized={canSend}
                        onUnauthorized={onAuthClick}
                        onSubmit={onOpen}
                        formIds={["email", "recipients"]}
                        beforeSubmitValidate={() => onValidateEmailForm() === null}
                    >
                        {canSend ? 'Отправить' : 'Авторизоваться для отправки'}
                    </FormSubmitButton>
                </Flex>

                <SendController
                    variant="email"
                    isOpen={isOpen}
                    onClose={onClose}
                    recipientsCount={recipientsCount}
                    getPayload={getValidEmails}
                    onSend={onSend}
                />
            </Box>
        </FormProvider>
    );
}