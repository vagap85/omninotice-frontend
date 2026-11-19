import { ButtonProps } from "@chakra-ui/react/button";
import { ReactNode } from "react";

export interface SidebarMenuEntry {
  label: string;
  icon?: ReactNode;
  href?: string;
  disabled?: boolean;
  submenuItems?: SidebarMenuEntry[];
}

export interface SidebarFlyoutMenuProps {
  submenuItems: SidebarMenuEntry[];
  title: string;
  isCollapsed: boolean;
  showIcons: boolean;
}

export interface SidebarMenuItemProps extends Omit<
  ButtonProps,
  'leftIcon' | 'rightIcon' | 'onClick' | 'as'
> {
  text: string;
  leftIcon?: ButtonProps['leftIcon'];
  rightIcon?: ButtonProps['rightIcon'];
  onClick?: () => void;
  href?: string;
  as?: 'button' | 'a';
  submenuItems?: SidebarMenuEntry[];
  isOpen?: boolean;
  onToggle?: (id: string) => void;
  submenuType?: 'inside' | 'outside';
  animateRightIcon?: boolean;
  btnVariant?: 'ghost' | 'primary';
}

export interface SidebarSubmenuItemProps {
  entry: SidebarMenuEntry;
  showIcon?: boolean;
  showSeparatorBefore?: boolean;
}

export interface SidebarSubmenuEntryProps {
  label: string;
  href?: string;
  icon?: ReactNode;
  showIcon?: boolean;
  isDisabled?: boolean;
  isActive?: boolean;
  isExpanded?: boolean;
  controls?: string;
  minW?: string;
  iconContainerSize?: string;
  onClick?: () => void;
  children?: ReactNode;
}