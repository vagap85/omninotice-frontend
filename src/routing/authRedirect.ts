import { ROUTES } from '@/routing/routes';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function getAuthRedirectPath(state: unknown): string {
  if (!isRecord(state) || !isRecord(state.from)) return ROUTES.home;

  const from = state.from;
  const pathname = from.pathname;
  const authRoutes: readonly string[] = [
    ROUTES.login,
    ROUTES.registration,
    ROUTES.about
  ];
  if (
    typeof pathname !== 'string' ||
    !pathname.startsWith('/') ||
    pathname.startsWith('//') ||
    pathname.startsWith('/\\') ||
    authRoutes.includes(pathname)
  ) {
    return ROUTES.home;
  }

  const search = typeof from.search === 'string' ? from.search : '';
  const hash = typeof from.hash === 'string' ? from.hash : '';
  return `${pathname}${search}${hash}`;
}
