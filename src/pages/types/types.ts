export type AuthState = {
  accessToken: string;
  tokenType: string;
  login?: string;
  firstName?: string;
  lastName?: string;
} | null;

export interface MailingDraft {
  subject: string;
  messageTitle: string;
  preheader: string;
  body: string;
  signature: string;
  actionText: string;
  actionLink: string;
  emails: string;
}