import type { ReactNode } from 'react';

// --- Domain: Links ---

/** Данные короткой ссылки (ответ API / хранилище) */
export interface LinkData {
  shortUrl: string;
  originalUrl: string;
  createdAt: string;
  isSecure: boolean;
  shortcut: string;
  shortcutId: string;
  securityScore?: number;
}

/** Строка таблицы реестра ссылок */
export interface LinkRow {
  id: string;
  name: string;
  description: string;
  shortUrl: string;
  /** Код короткой ссылки (последний сегмент shortUrl), пример: "39B4Sc" */
  shortcut?: string;
  targetUrl: string;
  campaign: string;
  tags: string[];
  status: 'active' | 'inactive' | 'blocked';
  /** Причина блокировки (только при status = 'blocked') */
  blockReason?: string | null;
  clicks: number;
  /** ISO 8601 UTC */
  createdAt?: string;
  modifiedAt?: string;
}

// --- Domain: Campaigns ---

/**
 * Строка таблицы кампаний.
 * В MVP — без детальных метрик (см. бэклог кампаний).
 */
export interface CampaignRow {
  id: string;
  name: string;
  description: string;
  linksCount: number;
  totalClicks: number;
  createdAt: string;
  modifiedAt?: string;
  tags: string[];
}

// --- Domain: Charts (LinkDetailPage) ---

export interface DailyDataPoint {
  date: string;
  value: number;
}

/** Статистика кликов по ссылке за период (GET .../statistics) */
export interface LinkStatistics {
  total: number;
  unique: number;
  byDay: DailyDataPoint[];
  /** Количество ссылок в кампании */
  linksCount?: number | null;
}

/** Ответ на GET /tags/ */
export interface TagItem {
  name: string;
  count: number;
}

export interface StatCard {
  label: string;
  value: string;
  sub?: string;
}

// --- Domain: Onboarding ---

export interface OnboardingStep {
  number: number;
  title: string;
  description: string;
  active: boolean;
}

// --- Domain: Security ---

export interface SafetyResult {
  url: string;
  threatLevel: 'safe' | 'suspicious' | 'blocked';
  isSafe: boolean;
  isSuspicious: boolean;
  isBlocked: boolean;
  reasons: string[];
  score: number;
  timestamp: string;
  checkedBy: string;
  recommendations: string[];
  error?: string;
}

/** Ответ проверки URL из API */
export interface UrlSafetyData {
  url: string;
  threatLevel: 'safe' | 'suspicious' | 'blocked';
  isSafe: boolean;
  isSuspicious: boolean;
  isBlocked: boolean;
  reasons: string[];
  score: number;
  timestamp: string;
  checkedBy: string;
  recommendations: string[];
  error?: string;
}

/** QR-код из API */
export interface QrCodeData {
  shortUrl: string;
  qrImageUrl: string;
  shortcut: string;
}

// --- Guest / Storage ---

/** Гостевая ссылка — хранится в localStorage для анонимных пользователей */
export interface GuestShortcut {
  shortUrl: string;
  originalUrl: string;
  shortcut: string;
  shortcutId: string;
  createdAt: string;
  expiresAt: string;
}

// --- Component Props ---

export interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
}

export interface QrModalProps {
  /** Короткий URL для отображения (пример: "omni/fbl2V") */
  shortUrl: string;
  /** Код ссылки для запроса в API (пример: "fbl2V") */
  shortcut: string;
  onClose: () => void;
}

export interface LinkShortenerProps {
  /** Колбэк после успешного сокращения — отдаёт готовую ссылку */
  onShortened: (data: LinkData) => void;
  /** Дополнительный колбэк успешного сокращения (скрыть маркетинговый блок) */
  onShortenSuccess?: () => void;
  /** Режим результата — поле заблокировано и показывает сокращённый URL */
  isResultMode?: boolean;
  /** URL, который пользователь сокращал (для показа в режиме результата) */
  originalUrl?: string;
}

export interface ResultCardProps {
  link: LinkData;
  originalUrl: string;
  onNewLink: () => void;
}

export interface ProgressModalProps {
  onClose: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
  duration?: number;
  title?: string;
  successMessage?: string;
  /** Текст ошибки операции — переводит модал в состояние ошибки */
  error?: string;
  /** Действие после ошибки */
  onRetry?: () => void;
}

export interface ShortenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (newLink: LinkRow) => void;
  /** Если передан, модал работает в режиме редактирования */
  editLink?: LinkRow | null;
  /** Колбэк сохранения в режиме редактирования */
  onEdited?: (updatedLink: LinkRow) => void;
  campaigns?: string[];
  availableTags?: string[];
}

// --- Validation ---

export interface ValidationResult {
  valid: boolean;
  message: string;
  type: 'empty' | 'invalid' | 'blocked' | 'suspicious' | '';
  url?: string;
}

export * from './profile';
