import { Box, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { EventForEMail } from '@/api/types';
import { useAuth } from '@/auth/AuthContext';
import DraftAutosave from '@/components/molecules/Form/DraftAutoSave';
import { useFormsRegistry } from '@/components/molecules/Form/hooks/useFormsRegistry';
import { FormProvider } from '@/components/molecules/Form/Providers/FormProvider';
import { FormsRegistryProvider } from '@/components/molecules/Form/Providers/FormsRegistryProvider';
import EmailMainFields from '@/components/organisms/Forms/Email/EmailMainFields';
import EmailThemeFields from '@/components/organisms/Forms/Email/EmailThemeFields';
import RecipientsPanel from '@/components/organisms/Forms/Email/Recipient/RecipientsPanel';

import { getSynoraMailTemplateName, getSynoraMailTopic, sendEventEmail } from '../../api/synora';
import PageHeader from '../../components/molecules/PageHeader/PageHeader';
import { MAILING_DRAFT_KEY } from '../../mailingDraftStorage';
import { MailingDraft, EmailFormValues } from '../types/types';

const emptyDraft = (): MailingDraft => ({
    subject: '', messageTitle: '', preheader: '', body: '', signature: '', actionText: '', actionLink: '', emails: '',
});

const readStoredDraft = (): MailingDraft => {
    const raw = sessionStorage.getItem(MAILING_DRAFT_KEY);
    if (!raw) return emptyDraft();
    try {
        const o = JSON.parse(raw) as Record<string, unknown>;
        const str = (v: unknown) => (typeof v === 'string' ? v : '');
        return {
            subject: str(o.subject), messageTitle: str(o.messageTitle), preheader: str(o.preheader),
            body: str(o.body), signature: str(o.signature), actionText: str(o.actionText),
            actionLink: str(o.actionLink), emails: str(o.emails),
        };
    } catch {
        return emptyDraft();
    }
};

export default function EmailNotification() {
    return (
        <FormsRegistryProvider>
            <EmailNotificationInner />
        </FormsRegistryProvider>
    );
}

function EmailNotificationInner() {
    const navigate = useNavigate();
    const registry = useFormsRegistry();
    const [draft] = useState<MailingDraft>(() => readStoredDraft());
    const { isAuthorized } = useAuth()

    const validateEmailForm = (): { title: string; description: string } | null => {
        const emailStore = registry.getOrCreateStore('email');
        const allValid = emailStore.validateAll();
        const { subject, messageTitle, body } = emailStore.getValues<EmailFormValues>();

        let hasError = false;

        if (!subject.trim()) {
            emailStore.setFieldError('subject', 'Поле обязательно для заполнения.');
            hasError = true;
        }

        const hasMessageTitle = Boolean(messageTitle?.trim());
        const hasBody = Boolean(body?.trim());
        if (!hasMessageTitle && !hasBody) {
            emailStore.setFieldError('messageTitle', 'Заполните хотя бы одно из полей');
            emailStore.setFieldError('body', 'Заполните хотя бы одно из полей');
            hasError = true;
        }

        if (!allValid) {
            hasError = true;
        }

        if (!hasError) return null;

        return {
            title: 'Заполните обязательные поля',
            description: 'Проверьте выделенные поля формы и повторите отправку.',
        };
    };

    const sendMailing = async (validEmails: string[]) => {
        if (!isAuthorized) throw new Error('Для отправки рассылки нужно авторизоваться');

        const { subject, messageTitle, body, preheader, signature, actionText, actionLink } =
            registry.getOrCreateStore('email').getValues<EmailFormValues>();

        const topic = getSynoraMailTopic();
        const templateName = getSynoraMailTemplateName();

        for (const sendTo of validEmails) {
            const payload: EventForEMail = {
                send_to: sendTo,
                data: {
                    subject: subject.trim(),
                    message_title: messageTitle.trim(),
                    preheader: preheader.trim(),
                    body: body.trim(),
                    signature: signature.trim(),
                    action_text: actionText.trim(),
                    action_link: actionLink.trim(),
                    source: 'omni-notice',
                },
            };
            if (templateName) payload.template_name = templateName;
            console.log('[Synora] mail-send queued', { sendTo, payload });
            await sendEventEmail(topic, payload);
        }
    };

    return (
        <Flex>
            <DraftAutosave />
            <Box flex="1" bg="#ECF2F8">
                <PageHeader
                    isAuthorized={isAuthorized}
                    title="Создание e-mail рассылки"
                />
                <Flex bg={"gray.100"}>
                    <FormProvider formId="email">
                        <Box as='form' flex="1" padding={6}>
                            <EmailThemeFields
                                initialSubject={draft.subject}
                                initialPreheader={draft.preheader}
                            />
                            <EmailMainFields
                                canImprove={isAuthorized}
                                initialValues={{
                                    messageTitle: draft.messageTitle,
                                    body: draft.body,
                                    signature: draft.signature,
                                    actionText: draft.actionText,
                                    actionLink: draft.actionLink,
                                }}
                            />
                        </Box>
                    </FormProvider>

                    <RecipientsPanel
                        initialEmails={draft.emails}
                        canSend={isAuthorized}
                        onAuthClick={() => navigate('/login')}
                        onValidateEmailForm={validateEmailForm}
                        onSend={sendMailing}
                    />
                </Flex>
            </Box>
        </Flex>
    );
}