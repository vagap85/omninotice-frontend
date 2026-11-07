import type { SelectedAppIcon } from '../types/types';

const DEFAULT_ICON_PATH = 'collections/bell-ring-icon.svg';

export function getCollectionIconSrc(icon?: SelectedAppIcon): string {
  const path = icon?.path ?? DEFAULT_ICON_PATH;
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}

export function getCollectionIconUrl(icon?: SelectedAppIcon): string {
  return new URL(getCollectionIconSrc(icon), window.location.origin).href;
}
