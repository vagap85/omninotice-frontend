import type { User } from '@/api/types';
import type { ProjectUser } from '@/api/vishenka';
import type { ComponentType } from 'react';
import type { IconProps } from '@/components/atoms/types/types';

export interface SelectedApp {
  project_id: string;
  color: string;
  title: string;
}

export interface SelectedAppIcon {
  id: string;
  path?: string;
  Icon?: ComponentType<IconProps>;
  title: string;
  description: string;
}

export interface SelectingRecipientAppContextValue {
  selectedApp: SelectedApp | null;
  setSelectedApp: (app: SelectedApp | null) => void;
  projectUsers: ProjectUser[];
  projectUsersLoaded: number;
  projectUsersTotal: number | null;
  isLoadingProjectUsers: boolean;
  projectUsersError: string | null;
  selectedIcon: SelectedAppIcon;
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
  project_id: string;
  color: string;
  title: string;
}

export interface AppSelectProps {
  apps?: SelectingApp[];
  value?: SelectingApp | null;
  onChange?: (app: SelectingApp) => void;
}

export type RecipientsMode = 'all' | 'individual';

export interface UsersSelectProps {
  value?: RecipientsMode;
  onChange?: (mode: RecipientsMode) => void;
}

export interface SearchInputProps {
  onSelectUser?: (user: User) => void;
  error: boolean;
}
