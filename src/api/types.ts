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
  tokenType: string;
  login?: string;
  firstName?: string;
  lastName?: string;
}

export interface UserCenterCreateSuccess {
  login: string;
  password: string;
}

export interface EventForEMail {
  send_to: string
  template_name?: string
  data?: Record<string, unknown>
}

export interface EventForAPI {
  send_to: string
  answer_to?: string
  method: string
  data: Record<string, unknown>
  headers?: Record<string, string>
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