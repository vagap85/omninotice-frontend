import { Flex } from '@chakra-ui/react';
import { useEffect, lazy, Suspense, ComponentType } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import SpinnerLoader from './components/atoms/Loaders/SpinnerLoader/SpinnerLoader';
import SidebarLayout from './components/layouts/SidebarLayout';
import { registerClearMailingDraftBeforeUnload } from './mailingDraftStorage';
import { NotFoundPage } from './pages/NotFoundPage/NotFoundPage';
import { OverviewPage } from './pages/OverviewPage/OverviewPage';
import AuthPages from './pages/Auth/AuthPages';
import TemplatesPage from './pages/TemplatesPage/TemplatesPage';
import ProtectedRoute from './routing/ProtectedRoute';
import { ROUTES } from './routing/routes';

function lazyWithMinDelay<P extends object>(
  factory: () => Promise<{ default: ComponentType<P> }>,
  minDelay = 400
) {
  return lazy(() =>
    Promise.all([
      factory(),
      new Promise((resolve) => setTimeout(resolve, minDelay))
    ]).then(([moduleExports]) => moduleExports)
  );
}

const HomePage = lazyWithMinDelay(() => import('@/pages/HomePage/HomePage'));
const EmailNotification = lazyWithMinDelay(
  () => import('@/pages/Notifications/EmailNotification')
);
const PushNotification = lazyWithMinDelay(
  () => import('@/pages/Notifications/PushNotification')
);

const TelegramNotification = lazyWithMinDelay(
  () => import('@/pages/Notifications/TelegramNotification')
);
const TelegramBotConnection = lazyWithMinDelay(
  () => import('@/pages/Notifications/TelegramBotConnection')
);
const NotificationHistoryPage = lazyWithMinDelay(
  () => import('@/pages/Notifications/PushNotificationHistory')
);
const AboutYourselfPage = lazyWithMinDelay(
  () => import('@/pages/Auth/AboutYourselfPage')
);
const LinksRegistryPage = lazyWithMinDelay(
  () => import('@/pages/Shortener/LinksRegistryPage/LinksRegistryPage')
);
const LinkDetailPage = lazyWithMinDelay(
  () => import('@/pages/Shortener/LinkDetailPage/LinkDetailPage')
);
const CampaignsPage = lazyWithMinDelay(
  () => import('@/pages/Shortener/CampaignsPage/CampaignsPage')
);
const LinksLandingPage = lazyWithMinDelay(
  () => import('@/pages/Shortener/LinksLandingPage/LinksLandingPage')
);
const ProfilePage = lazyWithMinDelay(
  () => import('@/pages/ProfilePage/ProfilePage')
);

function App() {
  useEffect(() => registerClearMailingDraftBeforeUnload(), []);

  return (
    <Suspense
      fallback={
        <Flex
          minW={'full'}
          minH={'100vh'}
          justifyContent={'center'}
          alignItems={'center'}
          bg={'#ECF2F8'}
        >
          <SpinnerLoader />
        </Flex>
      }
    >
      <Routes>
        <Route
          path={ROUTES.home}
          element={<HomePage />}
        />
        <Route
          path={ROUTES.linksLanding}
          element={<LinksLandingPage />}
        />
        <Route element={<SidebarLayout />}>
          <Route
            path={ROUTES.createEmail}
            element={<EmailNotification />}
          />
          <Route element={<ProtectedRoute />}>
            <Route
              path={ROUTES.createPush}
              element={<PushNotification />}
            />
            <Route
              path="/profile"
              element={<ProfilePage />}
            />
            <Route
              path={ROUTES.history}
              element={<NotificationHistoryPage />}
            />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route
              path={ROUTES.createTelegram}
              element={<TelegramNotification />}
            />
            <Route
              path={ROUTES.connectTelegramBot}
              element={<TelegramBotConnection />}
            />
          </Route>
          <Route
            path={ROUTES.overview}
            element={<OverviewPage />}
          />
          <Route
            path={ROUTES.templates}
            element={<TemplatesPage />}
          />
          <Route
            path={ROUTES.links}
            element={<LinksRegistryPage />}
          />
          <Route
            path={ROUTES.linkDetails}
            element={<LinkDetailPage />}
          />
          <Route
            path={ROUTES.campaigns}
            element={<CampaignsPage />}
          />
          <Route
            path="/dashboard"
            element={
              <Navigate
                to={ROUTES.overview}
                replace
              />
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <Navigate
                to="/profile"
                replace
              />
            }
          />
        </Route>
        <Route
          path={ROUTES.login}
          element={<AuthPages mode="login" />}
        />
        <Route
          path={ROUTES.registration}
          element={<AuthPages mode="register" />}
        />
        <Route element={<ProtectedRoute />}>
          <Route
            path={ROUTES.about}
            element={<AboutYourselfPage />}
          />
        </Route>

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </Suspense>
  );
}

export default App;
