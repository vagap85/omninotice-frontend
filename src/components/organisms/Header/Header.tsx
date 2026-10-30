import {
  Button,
  Flex,
  Grid,
  GridItem,
  useBreakpointValue
} from '@chakra-ui/react';

import { useAuth } from '@/auth/AuthContext';
import ArrowRightIcon from '@/components/atoms/Icons/home/ArrowRightIcon';
import LogoFigmaIcon from '@/components/atoms/Icons/home/LogoFigmaIcon';
import { AccountWidget } from '@/components/molecules/AccountWidget/AccountWidget';
import { ROUTES } from '@/routing/routes';

import Navigation from '../../molecules/Navigation/Navigation';

export default function Header() {
  const iconSize = useBreakpointValue({ base: 12, md: 16 }) ?? 16;
  const buttonText =
    useBreakpointValue({
      base: 'Попробовать',
      sm: 'Попробовать бесплатно'
    }) ?? 'Попробовать бесплатно';
  const { isAuthorized } = useAuth();

  return (
    <Grid
      as={'header'}
      mt={4}
      alignItems="center"
      gap={{
        base: '12px',
        md: '14px 40px'
      }}
      templateAreas={{
        base: `
                    "logo actions"
                    "nav nav"
                `,
        lg: `"logo nav actions"`
      }}
      templateColumns={{
        base: '110px 1fr',
        lg: '110px 1fr auto'
      }}
    >
      <GridItem area="logo">
        <LogoFigmaIcon />
      </GridItem>

      <GridItem
        area="nav"
        justifySelf={{ base: 'center', lg: 'auto' }}
        w={{ base: 'full', md: 'unset' }}
      >
        <Navigation />
      </GridItem>

      <GridItem area="actions">
        <Flex
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
              as="a"
              variant="outline"
              href={ROUTES.login}
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
            as="a"
            href={ROUTES.createEmail}
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
      </GridItem>
    </Grid>
  );
}
