import { useEffect } from 'react';

import { MAILING_DRAFT_KEY } from '@/mailingDraftStorage';

import { useFormValues } from './hooks/useFormValues';

export default function DraftAutosave() {
    const emailValues = useFormValues('email');
    const recipientsValues = useFormValues('recipients');

    useEffect(() => {
        const draft = {
            subject: emailValues.subject ?? '',
            messageTitle: emailValues.messageTitle ?? '',
            preheader: emailValues.preheader ?? '',
            body: emailValues.body ?? '',
            signature: emailValues.signature ?? '',
            actionText: emailValues.actionText ?? '',
            actionLink: emailValues.actionLink ?? '',
            emails: recipientsValues.emails ?? '',
        };
        sessionStorage.setItem(MAILING_DRAFT_KEY, JSON.stringify(draft));
    }, [emailValues, recipientsValues]);

    return null;
}