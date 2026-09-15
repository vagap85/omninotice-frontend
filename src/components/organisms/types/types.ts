import { TariffFeatureData } from "@/components/molecules/types/types";
import React from "react";

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
  onConfirm: () => Promise<void>;
  onRetry: () => Promise<void>;
  recipientsCount: number;
  variant: "email" | "push";
}