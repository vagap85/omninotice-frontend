import type { SVGProps } from 'react';

import type { SelectedAppIcon } from '../types/types';
import { getCollectionIconSrc } from './collectionIconUrl';

interface CollectionIconProps extends SVGProps<SVGSVGElement> {
  icon: SelectedAppIcon;
  size: number;
}

export default function CollectionIcon({
  icon,
  size,
  ...props
}: CollectionIconProps) {
  if (!icon.path) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
    >
      <use
        href={`${getCollectionIconSrc(icon)}#collection-icon`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}
