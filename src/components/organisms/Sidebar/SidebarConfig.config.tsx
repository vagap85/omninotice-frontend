import { ChevronDownIcon } from '@chakra-ui/icons';
import { BsGrid, BsPlusLg } from 'react-icons/bs';
import { FiFileText, FiLink, FiMail } from 'react-icons/fi';
import { GoHistory } from 'react-icons/go';
import { LuSquareUser } from 'react-icons/lu';

import LogoCherryIcon from '@/components/atoms/Icons/home/LogoCherryIcon';
import LogoMailIcon from '@/components/atoms/Icons/home/LogoMailIcon';
import LogoMaxIcon from '@/components/atoms/Icons/home/LogoMaxIcon';
import LogoSmsIcon from '@/components/atoms/Icons/home/LogoSmsIcon';
import LogoTelegramIcon from '@/components/atoms/Icons/home/LogoTelegramIcon';
import {
  SidebarMenuEntry,
  SidebarMenuItemProps
} from '@/components/molecules/types/sidebar';

const SUB_MENU_ICON_SIZE = 20;
const MENU_ICON_SIZE = 24;

export const createMenuEntries: SidebarMenuEntry[] = [
  {
    label: 'Email',
    icon: (
      <LogoMailIcon
        width={SUB_MENU_ICON_SIZE}
        height={SUB_MENU_ICON_SIZE}
      />
    ),
    href: '/create/email'
  },
  {
    label: 'Push',
    icon: (
      <LogoCherryIcon
        width={SUB_MENU_ICON_SIZE}
        height={SUB_MENU_ICON_SIZE}
      />
    ),
    href: '/create/push'
  },
  {
    label: 'SMS',
    icon: (
      <LogoSmsIcon
        width={SUB_MENU_ICON_SIZE}
        height={SUB_MENU_ICON_SIZE}
      />
    ),
    disabled: true
  },
  {
    label: 'Telegram',
    icon: (
      <LogoTelegramIcon
        width={SUB_MENU_ICON_SIZE}
        height={SUB_MENU_ICON_SIZE}
      />
    ),
    disabled: true
  },
  {
    label: 'Max',
    icon: (
      <LogoMaxIcon
        width={SUB_MENU_ICON_SIZE}
        height={SUB_MENU_ICON_SIZE}
      />
    ),
    disabled: true
  }
];

export const mailingMenuEntries: SidebarMenuEntry[] = createMenuEntries.map(
  (entry) =>
    entry.label === 'Push'
      ? {
          ...entry,
          submenuItems: [
            {
              label: 'Создать',
              icon: (
                <LogoCherryIcon
                  width={SUB_MENU_ICON_SIZE}
                  height={SUB_MENU_ICON_SIZE}
                />
              ),
              href: '/create/push'
            },
            {
              label: 'История',
              icon: (
                <LogoCherryIcon
                  width={SUB_MENU_ICON_SIZE}
                  height={SUB_MENU_ICON_SIZE}
                />
              ),
              disabled: true
            }
          ]
        }
      : entry
);

export const sidebarMenuItems: SidebarMenuItemProps[] = [
  {
    leftIcon: (
      <BsGrid
        size={MENU_ICON_SIZE}
        strokeWidth={0}
      />
    ),
    text: 'Обзор',
    as: 'a',
    href: '/overview'
  },
  {
    leftIcon: (
      <LuSquareUser
        size={MENU_ICON_SIZE}
        strokeWidth={1}
      />
    ),
    text: 'Контакты',
    disabled: true
  },
  {
    leftIcon: (
      <FiMail
        size={MENU_ICON_SIZE}
        strokeWidth={1}
      />
    ),
    text: 'Рассылки',
    rightIcon: (
      <ChevronDownIcon
        w={4}
        h={4}
      />
    ),
    submenuItems: mailingMenuEntries,
    submenuType: 'inside'
  },
  {
    leftIcon: (
      <GoHistory
        size={MENU_ICON_SIZE}
        strokeWidth={0}
      />
    ),
    text: 'История',
    disabled: true
  },
  {
    leftIcon: (
      <FiFileText
        strokeWidth={1}
        size={MENU_ICON_SIZE}
      />
    ),
    text: 'Шаблоны',
    as: 'a',
    href: '/templates'
  },
  {
    leftIcon: (
      <FiLink
        strokeWidth={1}
        size={MENU_ICON_SIZE}
      />
    ),
    text: 'Короткие ссылки',
    rightIcon: (
      <ChevronDownIcon
        w={4}
        h={4}
      />
    ),
    submenuItems: [
      { label: 'Все ссылки', href: '/links' },
      { label: 'Кампании', href: '/campaigns' }
    ],
    submenuType: 'inside'
  }
];

export const sidebarCreateAction = {
  icon: (
    <BsPlusLg
      strokeWidth="1"
      size={20}
    />
  ),
  text: 'Создать рассылку',
  submenuItems: createMenuEntries
};
