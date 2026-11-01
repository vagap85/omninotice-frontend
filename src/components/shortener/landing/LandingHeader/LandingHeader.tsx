import {
  Button,
  Flex,
  useBreakpointValue
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';

import moveLeftIcon from '@/assets/landing/move-left.svg';
import logoImage from '@/assets/logo.svg';
import { useAuth } from '@/auth/AuthContext';
import ArrowRightIcon from '@/components/atoms/Icons/home/ArrowRightIcon';
import { AccountWidget } from '@/components/molecules/AccountWidget/AccountWidget';
import { ROUTES } from '@/routing/routes';

import './LandingHeader.scss';

export default function LandingHeader() {
  const iconSize = useBreakpointValue({ base: 12, md: 16 }) ?? 16;
  const buttonText =
    useBreakpointValue({
      base: 'Попробовать',
      sm: 'Попробовать бесплатно'
    }) ?? 'Попробовать бесплатно';
  const { isAuthorized } = useAuth();

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

        <Flex
          className="landing-header__nav landing-header__nav--right"
          gap={{
            base: 1,
            md: 4
          }}
          alignItems="center"
          justifyContent="flex-end"
          flexWrap="wrap"
        >
          {!isAuthorized && (
            <Button
              as={Link}
              to={ROUTES.login}
              variant="outline"
              fontSize={{
                base: '12px',
                md: 'sm'
              }}
              padding={{
                base: '4px 8px',
                md: '10px 16px'
              }}
              minH="unset"
              lineHeight={{
                base: '12px',
                md: 'sm'
              }}
            >
              Войти
            </Button>
          )}

          <Button
            as={Link}
            to={ROUTES.createEmail}
            rightIcon={
              <ArrowRightIcon
                width={iconSize}
                height={iconSize}
              />
            }
            minH={'unset'}
            padding={{
              base: '4px 8px',
              md: '10px 16px'
            }}
            fontSize={{
              base: '12px',
              md: 'sm'
            }}
            lineHeight={{
              base: '12px',
              md: 'sm'
            }}
          >
            {buttonText}
          </Button>

          {isAuthorized && <AccountWidget />}
        </Flex>
      </div>
    </header>
  );
}
