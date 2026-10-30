import { ChevronDownIcon } from '@chakra-ui/icons';
import { BsGrid, BsPlusLg } from 'react-icons/bs';
import { FiFileText, FiLink, FiMail } from 'react-icons/fi';
import { GoHistory } from 'react-icons/go';
import { LuSquareUser } from 'react-icons/lu';

import {
  SidebarMenuEntry,
  SidebarMenuItemProps
} from '@/components/molecules/types/sidebar';
import { MAILING_CHANNELS, ROUTES } from '@/routing/routes';

const SUB_MENU_ICON_SIZE = 20;
const MENU_ICON_SIZE = 24;

export const createMenuEntries: SidebarMenuEntry[] = MAILING_CHANNELS.map(
  (channel) => {
    const Icon = channel.Icon;
    const entry: SidebarMenuEntry = {
      label: channel.sidebarLabel,
      icon: (
        <Icon
          width={SUB_MENU_ICON_SIZE}
          height={SUB_MENU_ICON_SIZE}
        />
      ),
      ...(channel.href ? { href: channel.href } : { disabled: true })
    };

    return channel.id === 'push'
      ? {
          ...entry,
          submenuItems: [
            {
              label: 'Создать',
              icon: (
                <Icon
                  width={SUB_MENU_ICON_SIZE}
                  height={SUB_MENU_ICON_SIZE}
                />
              ),
              href: channel.href
            },
            {
              label: 'История',
              icon: (
                <Icon
                  width={SUB_MENU_ICON_SIZE}
                  height={SUB_MENU_ICON_SIZE}
                />
              ),
              href: '/push/history'
            }
          ]
        }
      : entry;
  }
);

export const mailingMenuEntries = createMenuEntries;

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
    href: ROUTES.overview
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
    as: 'a',
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
    href: ROUTES.templates
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
      { label: 'Все ссылки', href: ROUTES.links },
      { label: 'Кампании', href: ROUTES.campaigns }
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
