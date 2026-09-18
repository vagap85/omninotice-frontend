export type AuthState = {
  accessToken: string;
  tokenType: string;
  login?: string;
  firstName?: string;
  lastName?: string;
} | null;

export interface EmailFormValues {
  subject: string;
  messageTitle: string;
  preheader: string;
  body: string;
  signature: string;
  actionText: string;
  actionLink: string;
}

export interface RecipientsFormValues {
  emails: string;
}

export type MailingDraft = EmailFormValues & RecipientsFormValues;