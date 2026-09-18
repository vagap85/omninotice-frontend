import type { ComponentType } from "react";

import { User } from "@/api/types";
import type { IconProps } from "@/components/atoms/types/types";

export interface SelectedApp {
  title: string;
  icon: SelectedAppIcon;         // текущая выбранная иконка
  standartIcon: SelectedAppIcon; // иконка по умолчанию для этого приложения
  iconColor: string;
  bgIconColor: string;
  description: string;
  count: number;
  platform: string;
}

export interface SelectedAppIcon {
  id: string;
  Icon: ComponentType<IconProps>;
  title: string;
  description: string;
}

export interface SelectingRecipientAppContextValue {
  selectedApp: SelectedApp | null;
  setSelectedApp: (app: SelectedApp | null) => void;
  setSelectedIcon: (icon: SelectedAppIcon) => void;
  recipientsMode: RecipientsMode;
  setRecipientsMode: (mode: RecipientsMode) => void;
  // errors
  appError: string | null;
  setAppError: (error: string | null) => void;
  recipientsError: string | null;
  setRecipientsError: (error: string | null) => void;
}

export interface SelectingApp {
  id: string;
  name: string;
  count: number;
  isActive: boolean;
  platform: string;
  iconColor: string;
  bgIconColor: string;
  standartIcon: SelectedAppIcon;
}

export interface AppSelectProps {
  apps?: SelectingApp[];
  value?: SelectingApp | null;
  onChange?: (app: SelectingApp) => void;
}

export type RecipientsMode = "all" | "individual";

export interface UsersSelectProps {
  value?: RecipientsMode;
  onChange?: (mode: RecipientsMode) => void;
}

export interface SearchInputProps {
  platform: string;
  onSelectUser?: (user: User) => void;
  error: boolean;
}