import { Link, useLocation } from 'react-router-dom';

import moveLeftIcon from '@/assets/landing/move-left.svg';
import logoImage from '@/assets/logo.svg';
import { useAuth } from '@/auth/AuthContext';
import ArrowRightIcon from '@/components/atoms/Icons/home/ArrowRightIcon';
import { AccountWidget } from '@/components/molecules/AccountWidget/AccountWidget';
import { ROUTES } from '@/routing/routes';

import './LandingHeader.scss';

export default function LandingHeader() {
  const location = useLocation();
  const { isAuthorized } = useAuth();
  const buttonText = 'Попробовать';

  return (
    <header className="landing-header">
      <div className="landing-header__container">
        <nav className="landing-header__nav landing-header__nav--left">
          <Link
            to={ROUTES.home}
            className="landing-header__link"
          >
            <img
              src={moveLeftIcon}
              alt=""
              className="landing-header__icon"
            />
            На главную
          </Link>
        </nav>

        <Link
          to={ROUTES.home}
          className="landing-header__logo"
        >
          <img
            src={logoImage}
            alt="Cherry"
            className="landing-header__logo-img"
          />
        </Link>

        <div className="landing-header__nav landing-header__nav--right">
          {!isAuthorized && (
            <Link
              to={ROUTES.login}
              state={{ from: location }}
              className="landing-header__link landing-header__link--outline"
            >
              Войти
            </Link>
          )}
          <Link
            to={ROUTES.registration}
            state={{ from: location }}
            className="landing-header__link landing-header__link--primary"
          >
            {buttonText}
            <span className="landing-header__arrow">
              <ArrowRightIcon />
            </span>
          </Link>

          {isAuthorized && <AccountWidget />}
        </div>
      </div>
    </header>
  );
}
