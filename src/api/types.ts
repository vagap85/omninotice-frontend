import { ComponentType } from "react";

interface ImproveTextResult {
  text: string;
  title: string;
  description: string;
}

export interface ImproveTextResponse {
  answerFirst: ImproveTextResult;
  answerSecond: ImproveTextResult;
}

export interface UserCenterLoginSuccess {
  accessToken: string;
  userId: string;
  login: string;
  accountId?: string | null;
  firstName?: string;
  lastName?: string;
}

export interface UserCenterCreateSuccess {
  login: string;
  password: string;
}

export interface EventForEMail {
  send_to: string;
  template_name?: string;
  data?: Record<string, unknown>;
}

export interface EventForAPI {
  send_to: string;
  answer_to?: string;
  method: string;
  data: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface User {
  id: string;
  full_name: string;
  platform: string;
}

export type EmailParams = {
  to_email: string;
  title: string;
  message: string;
};

/* ────────────────────────────── DISPATCH LOGS ────────────────────────────── */

export interface RawDispatchLog {
  event_id?: string;
  application_id?: string;
  channel?: string;
  send_method?: string;
  title?: string;
  body?: string;
  audience_type?: string;
  recipients?: string[];
  account_id?: string;
  created_at?: string;
  status?: string;
  template_name?: string;
  [key: string]: unknown;
}

export interface DispatchLog {
  event_id: string;
  application_id: string;
  channel: string;
  send_method: string;
  title: string;
  body: string;
  audience_type: string;
  recipients: string[];
  account_id: string;
  created_at: string;
  status: string;
  template_name: string;
}

/* ────────────────────────────── USERS ────────────────────────────── */

export interface RawProjectUser {
  user_id: string;
  user_type: string;
  registration_date: string;
  login: string;
  profile_id: string;
  flags?: Record<string, boolean>;
  [key: string]: unknown;
}

export interface ProjectUser {
  id: string;
  full_name: string;
  login: string;
  [key: string]: unknown;
}

/* ────────────────────────────── CONNECTED APPS ────────────────────────────── */

export interface ConnectedAppIcon {
  Icon: ComponentType;
  id?: string;
  title?: string;
  description?: string;
}

export interface ConnectedApp {
  project_id: string;
  color: string;
  title: string;
}

export interface ConnectedAppsResponseRaw {
  data?: Array<{
    settings?: Record<
      string,
      {
        connected_apps?: ConnectedApp[];
      }
    >;
  }>;
}

/* ────────────────────────────── DISPATCH ────────────────────────────── */

export interface DispatchRequest {
  request_id: string;
  delegated_token: string;
  account_id: string;
  application_id: string;
  channels: Array<'in_app' | 'tg'>;
  title: string;
  body: string;
  recipients: string[];
  created_at: string;
  action?: DispatchAction;
  picture?: {
    main?: string;
    icon: string;
    emoji?: string;
  };
}

export type DispatchAction =
  | {
      title: string;
      url: string;
      type: 'button';
    }
  | {
      name: string;
      url: string;
    };

export interface ResponseDetail {
  code: 'OK' | 'ALREADY_APPLIED' | null;
  message: string | null;
}

export interface DispatchData {
  request_id: string;
  status: 'accepted' | 'replayed' | 'failed';
  already_applied: boolean;
  author_user_id: string;
  created_at: string;
}

export interface ResponseInfo {
  api_version: string;
  count?: number;
  total?: number;
  page?: number;
  page_size?: number;
  [key: string]: unknown;
}

export interface SuccessfulResponse {
  detail: ResponseDetail;
  data: DispatchData[];
  info: ResponseInfo;
}