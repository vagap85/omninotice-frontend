import type { ButtonProps } from '@/types/shortener';
import './Button.scss';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}: ButtonProps) {
  const sizeClass = size ? `btn--${size}` : '';
  const variantClass = variant ? `btn--${variant}` : '';

  return (
    <button
      type={type}
      className={`btn ${sizeClass} ${variantClass} ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
