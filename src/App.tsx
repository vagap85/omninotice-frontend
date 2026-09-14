import { useEffect, lazy, Suspense, ComponentType } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { registerClearMailingDraftBeforeUnload } from "./mailingDraftStorage";
import { Flex } from "@chakra-ui/react";
import SpinnerLoader from "./components/atoms/Loaders/SpinnerLoader/SpinnerLoader";

function lazyWithMinDelay<T extends { default: ComponentType<any> }>(
  factory: () => Promise<T>,
  minDelay = 400
) {
  return lazy(() =>
    Promise.all([
      factory(),
      new Promise((resolve) => setTimeout(resolve, minDelay)),
    ]).then(([moduleExports]) => moduleExports)
  );
}

const HomePage = lazyWithMinDelay(() => import('@/pages/HomePage/HomePage'));
const CreateNotification = lazyWithMinDelay(() => import('@/pages/back-up/CreateNotification'));
const EmailNotification = lazyWithMinDelay(() => import('@/pages/Notifications/EmailNotification'));
const PushNotification = lazyWithMinDelay(() => import('@/pages/Notifications/PushNotification'));
const RegistrationPage = lazyWithMinDelay(() => import('@/pages/back-up/RegistrationPage'));
const AuthLoginPage = lazyWithMinDelay(() => import('@/pages/Auth/AuthLoginPage'));
const AuthRegisterPage = lazyWithMinDelay(() => import('@/pages/Auth/AuthRegisterPage'));

function App() {
  useEffect(() => registerClearMailingDraftBeforeUnload(), []);

  return (
    <Suspense fallback={
      <Flex
        minW={"full"}
        minH={"100vh"}
        justifyContent={"center"}
        alignItems={"center"}
        bg={"#ECF2F8"}
      >
        <SpinnerLoader />
      </Flex>
    }>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create/back-up/email" element={<CreateNotification />} />

        <Route path="/create/email" element={<EmailNotification />} />
        <Route path="/create/push" element={<PushNotification />} />
        <Route path="/login" element={<AuthLoginPage />} />
        <Route path="/registration" element={<AuthRegisterPage />} />
        
        <Route path="/back-up/registration/" element={<RegistrationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;