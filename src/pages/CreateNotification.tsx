import { useState } from "react";
import { Box, Flex } from "@chakra-ui/react";

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

export default function CreateNotification() {
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [body, setBody] = useState("");
  const [emails, setEmails] = useState("");

  const sendMailing = async () => {
    const subjectTrim = subject.trim();
    const bodyTrim = body.trim();
    if (!subjectTrim) {
      throw new Error("Укажите тему письма");
    }
    if (!bodyTrim) {
      throw new Error("Введите текст письма");
    }

    const tokens = emails.trim().split(/\s+/).filter(Boolean);
    const invalid = tokens.filter((t) => !isValidEmail(t));
    if (invalid.length > 0) {
      throw new Error(
        `Некорректные email: ${invalid.join(", ")}. Укажите адреса через пробел.`,
      );
    }
    if (tokens.length === 0) {
      throw new Error("Добавьте хотя бы один email получателя");
    }

    const topic = getSynoraMailTopic();
    const templateName = getSynoraMailTemplateName();

    try {
      for (const sendTo of tokens) {
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
        <PageHeader />
        <Flex>
          <Box flex="1">
            <EmailThemeInput
              subject={subject}
              preheader={preheader}
              onSubjectChange={setSubject}
              onPreheaderChange={setPreheader}
            />

            <EmailMainInput title={subject} preheader={preheader} body={body} setTitle={setSubject} setPreheader={setPreheader} setBody={setBody} />
          </Box>

          <AddRecipientsBar
            recipients={emails}
            onRecipientsChange={setEmails}
            onSend={sendMailing}
          />
        </Flex>
      </Box>
    </Flex>
  );
}
