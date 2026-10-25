import { useNavigate } from 'react-router-dom';

import chartIcon from '@/assets/landing/chart_data.svg';
import { useAuth } from '@/auth/AuthContext';
import { claimAllGuestShortcuts } from '@/utils/guestShortcuts';

import './AuthPrompt.scss';

type AuthTarget = '/login' | '/registration';

function AuthPrompt() {
  const navigate = useNavigate();
  const { authState } = useAuth();

  /**
   * Переход на страницу авторизации. Если пользователь уже авторизован —
   * предварительно закрепляем гостевые ссылки за аккаунтом.
   */
  const handleAuthFlow = (target: AuthTarget): void => {
    const projectId =
      (import.meta.env.VITE_SHORTENER_PROJECT_ID as string) || '';

    if (authState?.accessToken && projectId) {
      void claimAllGuestShortcuts(authState.accessToken, projectId);
    }

    navigate(target);
  };

  return (
    <div className="auth-prompt">
      <div className="auth-prompt__icon">
        <img
          src={chartIcon}
          alt="Управление ссылками"
        />
      </div>
      <div className="auth-prompt__content">
        <h3 className="auth-prompt__title">Хотите управлять ссылками?</h3>
        <p className="auth-prompt__description">
          Храните все короткие ссылки в личном кабинете, редактируйте целевой
          URL и отслеживайте переходы.
        </p>
      </div>
      <div className="auth-prompt__actions">
        <button
          type="button"
          className="auth-prompt__btn auth-prompt__btn--outline"
          onClick={() => handleAuthFlow('/login')}
        >
          Войти
        </button>
        <button
          type="button"
          className="auth-prompt__btn auth-prompt__btn--primary"
          onClick={() => handleAuthFlow('/registration')}
        >
          Зарегистрироваться
        </button>
      </div>
    </div>
  );
}

export default AuthPrompt;
