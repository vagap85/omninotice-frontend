import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import CreateNotification from "./pages/CreateNotification";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import RegistrationPage from "./pages/RegistrationPage";
import { registerClearMailingDraftBeforeUnload } from "./mailingDraftStorage";
import PushCreateNotificaton from "./pages/PushCreateNotificaton";

function App() {
  useEffect(() => registerClearMailingDraftBeforeUnload(), []);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/create" element={<CreateNotification />} />
      <Route path="/create-push" element={<PushCreateNotificaton />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/registration" element={<RegistrationPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
