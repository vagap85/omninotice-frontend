import React from "react";

import { User } from "@/api/types";
import type { TariffFeatureData } from "@/components/molecules/types/types";

import type { SelectedAppIcon } from "../Forms/Push/SelectingRecipientApp/types/types";

export interface TariffCardProps {
  title: string;
  subtitle: string;
  features: TariffFeatureData[];
  isHighlighted: boolean;
}

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface EmailMainFieldsProps {
  canImprove: boolean;
  initialValues?: {
    messageTitle?: string;
    body?: string;
    signature?: string;
    actionText?: string;
    actionLink?: string;
  };
}

export interface EmailThemeFieldsProps {
  initialSubject?: string;
  initialPreheader?: string;
}

export interface LogoutModalProps {
  logout: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export type SendStatus = "confirm" | "loading" | "error";

export interface ModalSendProps {
  isOpen: boolean;
  onClose: () => void;
  status: SendStatus;
  progress: number;
  onConfirm: () => void;
  onRetry: () => void;
  confirmMessage: string;
}

interface TextVariant {
  id: number;
  title: string;
  preheader: string;
  body: string;
}

export interface ImproveTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalVariant: TextVariant;
  improvedVariant: TextVariant;
  onApply: (variant: TextVariant) => void;
}

export interface SelectIconModalProps {
  isOpen: boolean;
  onClose: () => void;
  icons: SelectedAppIcon[];
}

type ValidationError = { title: string; description: string };

export interface RecipientsPanelProps {
  initialEmails?: string;
  canSend: boolean;
  onAuthClick: () => void;
  // Проверяет форму письма (formId="email") и возвращает ошибку, если что-то не так
  onValidateEmailForm: () => ValidationError | null;
  // Отправка: получает готовые данные письма и список валидных email
  onSend: (validEmails: string[]) => Promise<void>;
}

export type SendVariant = "email" | "push";

export interface SendControllerProps<TPayload> {
  variant: SendVariant;
  isOpen: boolean;
  onClose: () => void;
  recipientsCount: number;
  getPayload: () => TPayload;
  onSend: (payload: TPayload) => Promise<void>;
}

export type SendMessages = {
  confirmMessage: (count: number) => string;
  successMessage: (count: number) => { title: string; description: string };
};

export interface PushPayload {
  title: string;
  text: string;
  buttonText: string;
  buttonLink: string;
  app: unknown;
  recipientsMode: string;
  selectedUsers: User[] | undefined;
}

export interface PushNotificationFormValues {
  title: string;
  text: string;
  buttonText: string;
  buttonLink: string;
}