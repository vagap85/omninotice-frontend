export interface TariffFeatureData {
  text: string;
  isDisabled: boolean;
}

export interface TariffCardFeatureProps extends TariffFeatureData {
  isHighlighted: boolean;
}

export interface PageHeaderProps {
  isAuthorized: boolean;
  title: string;
}