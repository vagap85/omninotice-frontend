import { Flex } from "@chakra-ui/react";
import { useEffect, lazy, Suspense, ComponentType } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import SpinnerLoader from "./components/atoms/Loaders/SpinnerLoader/SpinnerLoader";
import { registerClearMailingDraftBeforeUnload } from "./mailingDraftStorage";
import ProtectedRoute from "./routing/ProtectedRoute";

function lazyWithMinDelay<P extends object>(
  factory: () => Promise<{ default: ComponentType<P> }>,
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
const EmailNotification = lazyWithMinDelay(() => import('@/pages/Notifications/EmailNotification'));
const PushNotification = lazyWithMinDelay(() => import('@/pages/Notifications/PushNotification'));
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
        <Route path="/create/email" element={<EmailNotification />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/create/push" element={<PushNotification />} />
        </Route>

        <Route path="/login" element={<AuthLoginPage />} />
        <Route path="/registration" element={<AuthRegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;