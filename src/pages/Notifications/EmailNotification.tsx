import { useRef } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { type EventForEMail, getSynoraMailTemplateName, getSynoraMailTopic, sendEventEmail } from '../../api/synora';
import PageHeader from '../../components/molecules/PageHeader/PageHeader';
import { MAILING_DRAFT_KEY } from '../../mailingDraftStorage';
import { FormProvider, FormsRegistryProvider, useFormsRegistry } from '@/components/molecules/Form/FormContext';
import EmailMainFields from '@/components/organisms/Forms/Email/EmailMainFields';
import EmailThemeFields from '@/components/organisms/Forms/Email/EmailThemeFields';
import RecipientsPanel from '@/components/organisms/Forms/Recipient/RecipientsPanel';
import DraftAutosave from '@/components/molecules/Form/DraftAutoSave';
import { MailingDraft } from '../types/types';
import { useAuth } from '@/auth/AuthContext';

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
    const draftRef = useRef<MailingDraft>(readStoredDraft());
    const { isAuthorized } = useAuth()

    const validateEmailForm = (): { title: string; description: string } | null => {
        const emailStore = registry.getOrCreateStore('email');
        const allValid = emailStore.validateAll();
        const { subject, messageTitle, body } = emailStore.getValues();

        if (!subject.trim()) {
            return {
                title: 'Заполните обязательные поля',
                description: 'Поле обязательно для заполнения.'
            };
        }

        const hasMessageTitle = Boolean(messageTitle?.trim());
        const hasBody = Boolean(body?.trim());
        if (!hasMessageTitle && !hasBody) {
            emailStore.setFieldError('messageTitle', 'Заполните хотя бы одно из полей');
            emailStore.setFieldError('body', 'Заполните хотя бы одно из полей');
            return {
                title: 'Заполните обязательные поля',
                description: 'Заполните хотя бы одно поле: «Заголовок письма» или «Основная часть письма».',
            };
        }

        if (!allValid) {
            return {
                title: 'Некорректная ссылка для кнопки',
                description: 'Проверьте ссылку и укажите валидный URL в формате http(s)://...',
            };
        }

        return null;
    };

    const sendMailing = async (validEmails: string[]) => {
        if (!isAuthorized) throw new Error('Для отправки рассылки нужно авторизоваться');

        const { subject, messageTitle, body, preheader, signature, actionText, actionLink } =
            registry.getOrCreateStore('email').getValues();

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
            console.log('[Synora] mail-send queued', { sendTo, payload});
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
                                initialSubject={draftRef.current.subject}
                                initialPreheader={draftRef.current.preheader}
                            />
                            <EmailMainFields
                                canImprove={isAuthorized}
                                initialValues={{
                                    messageTitle: draftRef.current.messageTitle,
                                    body: draftRef.current.body,
                                    signature: draftRef.current.signature,
                                    actionText: draftRef.current.actionText,
                                    actionLink: draftRef.current.actionLink,
                                }}
                            />
                        </Box>
                    </FormProvider>

                    <RecipientsPanel
                        initialEmails={draftRef.current.emails}
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