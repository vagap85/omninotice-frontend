import type { ComponentType } from 'react';

import type { IconProps } from '@/components/atoms/types/types';
import LogoCherryIcon from '@/components/atoms/Icons/home/LogoCherryIcon';
import LogoMailIcon from '@/components/atoms/Icons/home/LogoMailIcon';
import LogoMaxIcon from '@/components/atoms/Icons/home/LogoMaxIcon';
import LogoSmsIcon from '@/components/atoms/Icons/home/LogoSmsIcon';
import LogoTelegramIcon from '@/components/atoms/Icons/home/LogoTelegramIcon';

export const ROUTES = {
  home: '/',
  linksLanding: '/links-landing',
  createEmail: '/create/email',
  createPush: '/create/push',
  createTelegram: '/create/telegram',
  connectTelegramBot: '/create/telegram/connect',
  overview: '/overview',
  history: "/push/history",
  templates: '/templates',
  links: '/links',
  linkDetails: '/links/:id',
  campaigns: '/campaigns',
  login: '/login',
  registration: '/registration'
} as const;

interface MailingChannel {
  id: string;
  label: string;
  sidebarLabel: string;
  heroLabel: string;
  href?: string;
  hint?: string;
  Icon: ComponentType<IconProps>;
}

export const MAILING_CHANNELS: MailingChannel[] = [
  {
    id: 'email',
    label: 'По e-mail',
    sidebarLabel: 'Email',
    heroLabel: 'e-mail',
    href: ROUTES.createEmail,
    Icon: LogoMailIcon
  },
  {
    id: 'push',
    label: 'Push',
    sidebarLabel: 'Push',
    heroLabel: 'Push-уведомления',
    href: ROUTES.createPush,
    Icon: LogoCherryIcon
  },
  {
    id: 'sms',
    label: 'По смс',
    sidebarLabel: 'SMS',
    heroLabel: 'SMS',
    hint: 'СКОРО',
    Icon: LogoSmsIcon
  },
  {
    id: 'telegram',
    label: 'В телеграм',
    sidebarLabel: 'Telegram',
    heroLabel: 'Telegram',
    href: ROUTES.createTelegram,
    Icon: LogoTelegramIcon
  },
  {
    id: 'max',
    label: 'В MAX',
    sidebarLabel: 'Max',
    heroLabel: 'MAX',
    hint: 'СКОРО',
    Icon: LogoMaxIcon
  }
].sort(
  (first, second) =>
    Number(!first.href) - Number(!second.href)
);

export const PAGE_TITLES: Partial<Record<string, string>> = {
  [ROUTES.createEmail]: 'Создание e-mail рассылки',
  [ROUTES.createPush]: 'Создание рассылки push-уведомлений',
  [ROUTES.createTelegram]: 'Создание Telegram-рассылки',
  [ROUTES.connectTelegramBot]: 'Создание Telegram-рассылки',
  [ROUTES.overview]: 'Обзор',
  [ROUTES.history]: 'История рассылок push-уведомлений',
  [ROUTES.templates]: 'Шаблоны рассылок'
};

export const COLLAPSED_SIDEBAR_ROUTES = [
  ROUTES.createEmail,
  ROUTES.createPush,
  ROUTES.createTelegram,
  ROUTES.connectTelegramBot,
  ROUTES.history,
  ROUTES.templates
] as const;
