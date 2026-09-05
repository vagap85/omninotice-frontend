import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import SelectingRecipientApp from "../components/SelectingRecipientApp/SelectingRecipientApp";
import NotificationContentSection from "@/components/Push/NotificationContentSection";
import ActionSection from "@/components/Push/ActionSection";
import type { AuthState } from "./types/types";
import { getStoredAuth } from "./helpers/getStoredAuth";
import { isValidActionLink } from "./helpers/isValidActionLink";

const AUTH_STORAGE_KEY = "usercenter_auth";

// TODO: Добавить валидацию данных, вместо заглушек, когда появится документацию к бэкенду 

export default function PushCreateNotificaton() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [notificationTitle, setNotificationTitle] = useState(
        () => searchParams.get("title") ?? ""
    );
    const [notificationText, setNotificationText] = useState(
        () => searchParams.get("text") ?? ""
    );
    const [buttonText, setButtonText] = useState(
        () => searchParams.get("buttonText") ?? ""
    );
    const [buttonLink, setButtonLink] = useState("");

    const [authState, setAuthState] = useState<AuthState>(getStoredAuth(AUTH_STORAGE_KEY));

    useEffect(() => {
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);

                if (notificationTitle) next.set("title", notificationTitle);
                else next.delete("title");

                if (notificationText) next.set("text", notificationText);
                else next.delete("text");

                if (buttonText) next.set("buttonText", buttonText);
                else next.delete("buttonText");

                return next;
            },
            { replace: true }
        );
    }, [notificationTitle, notificationText, buttonText, setSearchParams]);

    const isActionLinkValid = useMemo(() => isValidActionLink(buttonLink), [buttonLink]);
    const isAuthorized = Boolean(authState?.accessToken);

    // стабильные ссылки на колбэки, чтобы memo(...) на дочерних компонентах реально работал
    const handleLogout = useCallback(() => {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        setAuthState(null);
        navigate("/");
    }, [navigate]);


    return (
        <Flex>
            <Box flex="1" bg="#f2f2f2">
                <PageHeader
                    isAuthorized={isAuthorized}
                    userName={authState?.login || "mail@mail.ru"}
                    onLogout={handleLogout}
                    title="Создание рассылки push-уведомлений"
                />
                <Flex>
                    <Flex direction={"column"} gap={5} flex="1" padding={6}>
                        <NotificationContentSection
                            title={notificationTitle}
                            onTitleChange={setNotificationTitle}
                            text={notificationText}
                            onTextChange={setNotificationText}
                        />
                        <ActionSection
                            buttonText={buttonText}
                            onButtonTextChange={setButtonText}
                            buttonLink={buttonLink}
                            onButtonLinkChange={setButtonLink}
                            isLinkValid={isActionLinkValid}
                        />
                    </Flex>
                    <SelectingRecipientApp isAuthorized={isAuthorized}/>
                </Flex>
            </Box>
        </Flex>
    );
}