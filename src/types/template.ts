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
  channel: string;
  variables: TemplateVariable[];
  usageCount?: number;
  updatedAt?: string;
}
