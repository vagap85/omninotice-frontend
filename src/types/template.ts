export type TemplateChannel = 'cherry' | 'email' | 'sms' | 'telegram' | 'max';

export interface TemplateVariable {
  key: string;
  label: string;
  isAutoFilled?: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  buttonText?: string;
  channel: TemplateChannel;
  variables: TemplateVariable[];
  updatedAt: string;
  usageCount: number;
}
