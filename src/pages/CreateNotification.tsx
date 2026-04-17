import { useEffect, useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import {
  type EventForEMail,
  getSynoraMailTemplateName,
  getSynoraMailTopic,
  sendEventEmail,
} from "../api/synora";
import { isValidEmail } from "../utils/recipient";

import PageHeader from "../components/PageHeader";
import SideBar from "../components/SideBar";
import EmailThemeInput from "../components/Email/EmailThemeInput";
import EmailMainInput from "../components/Email/EmailMainInput";
import AddRecipientsBar from "../components/AddRecipientsBar";
import { MAILING_DRAFT_KEY } from "../mailingDraftStorage";

const AUTH_STORAGE_KEY = "usercenter_auth";

type MailingDraft = {
  subject: string;
  preheader: string;
  body: string;
  emails: string;
};

const emptyDraft = (): MailingDraft => ({
  subject: "",
  preheader: "",
  body: "",
  emails: "",
});

const readStoredDraft = (): MailingDraft => {
  const raw = sessionStorage.getItem(MAILING_DRAFT_KEY);
  if (!raw) {
    return emptyDraft();
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return emptyDraft();
    }
    const o = parsed as Record<string, unknown>;
    const str = (v: unknown) => (typeof v === "string" ? v : "");
    return {
      subject: str(o.subject),
      preheader: str(o.preheader),
      body: str(o.body),
      emails: str(o.emails),
    };
  } catch {
    return emptyDraft();
  }
};

type AuthState = {
  accessToken: string;
  tokenType: string;
  login?: string;
  firstName?: string;
  lastName?: string;
} | null;

type RequiredFieldErrors = {
  subject: boolean;
  body: boolean;
};

const getStoredAuth = (): AuthState => {
  const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthState;
    if (!parsed?.accessToken || !parsed?.tokenType) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export default function CreateNotification() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState(() => readStoredDraft().subject);
  const [preheader, setPreheader] = useState(() => readStoredDraft().preheader);
  const [body, setBody] = useState(() => readStoredDraft().body);
  const [emails, setEmails] = useState(() => readStoredDraft().emails);
  const [authState, setAuthState] = useState<AuthState>(getStoredAuth);
  const [requiredErrors, setRequiredErrors] = useState<RequiredFieldErrors>({
    subject: false,
    body: false,
  });

  const isAuthorized = Boolean(authState?.accessToken);

  useEffect(() => {
    const draft: MailingDraft = { subject, preheader, body, emails };
    sessionStorage.setItem(MAILING_DRAFT_KEY, JSON.stringify(draft));
  }, [subject, preheader, body, emails]);

  const validateRequiredFields = (): string | null => {
    const nextErrors: RequiredFieldErrors = {
      subject: !subject.trim(),
      body: !body.trim(),
    };
    setRequiredErrors(nextErrors);

    if (nextErrors.subject || nextErrors.body) {
      return "Тема и основная часть письма должны быть заполнены.";
    }

    return null;
  };

  const sendMailing = async () => {
    if (!isAuthorized) {
      throw new Error("Для отправки рассылки нужно авторизоваться");
    }

    const requiredValidationError = validateRequiredFields();
    if (requiredValidationError) {
      throw new Error(requiredValidationError);
    }

    const subjectTrim = subject.trim();
    const bodyTrim = body.trim();

    const tokens = emails.trim().split(/\s+/).filter(Boolean);
    const validEmails = tokens.filter((t) => isValidEmail(t));
    if (tokens.length === 0) {
      throw new Error("Добавьте хотя бы один email адрес");
    }
    if (validEmails.length === 0) {
      throw new Error("Нет корректных email адресов для отправки");
    }

    const topic = getSynoraMailTopic();
    const templateName = getSynoraMailTemplateName();

    try {
      for (const sendTo of validEmails) {
        const payload: EventForEMail = {
          send_to: sendTo,
          data: {
            subject: subjectTrim,
            preheader: preheader.trim(),
            body: bodyTrim,
            source: "omni-notice",
          },
        };
        if (templateName) {
          payload.template_name = templateName;
        }
        const res = await sendEventEmail(topic, payload)
        // Важно для дебага: Synora возвращает event_id, по нему можно смотреть цепочку доставки.
        console.log("[Synora] mail-send queued", { sendTo, event_id: res.event_id })
      }
    } catch (error) {
      console.error("Ошибка отправки:", error);
      throw error;
    }
  };

  return (
    <Flex>
      <SideBar />
      <Box flex="1" bg="#f2f2f2">
        <PageHeader
          isAuthorized={isAuthorized}
          onLogout={() => {
            sessionStorage.removeItem(AUTH_STORAGE_KEY);
            setAuthState(null);
          }}
        />
        <Flex>
          <Box flex="1">
            <EmailThemeInput
              subject={subject}
              preheader={preheader}
              onSubjectChange={(value) => {
                setSubject(value);
                if (value.trim()) {
                  setRequiredErrors((prev) => ({ ...prev, subject: false }));
                }
              }}
              onPreheaderChange={(value) => {
                setPreheader(value);
              }}
              subjectInvalid={requiredErrors.subject}
            />

            <EmailMainInput
              title={subject}
              preheader={preheader}
              body={body}
              setTitle={setSubject}
              setPreheader={setPreheader}
              setBody={(value) => {
                setBody(value);
                if (value.trim()) {
                  setRequiredErrors((prev) => ({ ...prev, body: false }));
                }
              }}
              canImprove={isAuthorized}
              bodyInvalid={requiredErrors.body}
            />
          </Box>

          <AddRecipientsBar
            recipients={emails}
            onRecipientsChange={setEmails}
            onSend={sendMailing}
            canSend={isAuthorized}
            onAuthClick={() => navigate("/login")}
            onValidateBeforeSend={validateRequiredFields}
          />
        </Flex>
      </Box>
    </Flex>
  );
}
