import { Link } from 'react-router-dom';

import chartIcon from '@/assets/landing/chart_data.svg';
import linkIcon from '@/assets/landing/link.svg';
import personIcon from '@/assets/landing/person.svg';
import verifiedIcon from '@/assets/landing/verified_user.svg';
import { useAuth } from '@/auth/AuthContext';
import { ROUTES } from '@/routing/routes';
import { claimAllGuestShortcuts } from '@/utils/guestShortcuts';

import './MarketingBlock.scss';

const ShortLinkIcon = () => (
  <img
    src={linkIcon}
    alt="Link"
  />
);

const ChartData = () => (
  <img
    src={chartIcon}
    alt="Analytic"
  />
);

const Person = () => (
  <img
    src={personIcon}
    alt="Person"
  />
);

const VerifiedUser = () => (
  <img
    src={verifiedIcon}
    alt="VerifiedUser"
  />
);

export function MarketingBlock() {
  const { authState } = useAuth();

  // Если пользователь уже авторизован — закрепляем гостевые ссылки за
  // аккаунтом прямо перед переходом на регистрацию
  const handleRegister = (): void => {
    const projectId =
      (import.meta.env.VITE_SHORTENER_PROJECT_ID as string) || '';

    if (!authState?.accessToken || !projectId) return;

    void claimAllGuestShortcuts(authState.accessToken, projectId);
  };

  return (
    <section className="marketing-block">
      <div className="marketing-block__wrapper">
        {/* ЛЕВАЯ ЧАСТЬ */}
        <div className="marketing-block__left">
          <span className="marketing-block__title">
            Больше возможностей
          </span>
          <br />
          <span className="marketing-block__title marketing-block__title--accent">
            для вашего маркетинга
          </span>
          <p className="marketing-block__subtitle">
            Храните все короткие ссылки в личном кабинете, редактируйте целевой
            URL и отслеживайте переход.
          </p>

          <Link
            to={ROUTES.registration}
            className="marketing-block__btn"
            aria-label="Зарегистрироваться"
            onClick={handleRegister}
          >
            Зарегистрироваться
          </Link>
        </div>

        {/* ПРАВАЯ ЧАСТЬ */}
        <div className="marketing-block__right">
          <div className="marketing-block__card">
            <div className="marketing-block__row">
              <div className="marketing-block__icon">
                <ShortLinkIcon />
              </div>
              <div className="marketing-block__content">
                <h3 className="marketing-block__card-title">
                  Короткие ссылки
                </h3>
                <p className="marketing-block__card-description">
                  Легко делитесь ссылками в мессенджерах, соцсетях и письмах.
                </p>
              </div>
            </div>
          </div>
          <div className="marketing-block__card">
            <div className="marketing-block__row">
              <div className="marketing-block__icon">
                <ChartData />
              </div>
              <div className="marketing-block__content">
                <h3 className="marketing-block__card-title">
                  Аналитика переходов
                </h3>
                <p className="marketing-block__card-description">
                  Смотрите, сколько людей переходят по ссылкам, и откуда.
                </p>
              </div>
            </div>
          </div>
          <div className="marketing-block__card">
            <div className="marketing-block__row">
              <div className="marketing-block__icon">
                <Person />
              </div>
              <div className="marketing-block__content">
                <h3 className="marketing-block__card-title">
                  Удобное управление с регистрацией
                </h3>
                <p className="marketing-block__card-description">
                  Редактируйте ссылки, добавляйте UTM-метки и сохраняйте их в
                  личном кабинете.
                </p>
              </div>
            </div>
          </div>
          <div className="marketing-block__card">
            <div className="marketing-block__row">
              <div className="marketing-block__icon">
                <VerifiedUser />
              </div>
              <div className="marketing-block__content">
                <h3 className="marketing-block__card-title">
                  Безопасность и надежность
                </h3>
                <p className="marketing-block__card-description">
                  Проверяем ссылки на вирусы и фишинг.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
