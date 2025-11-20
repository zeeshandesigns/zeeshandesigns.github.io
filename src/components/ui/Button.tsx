import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Loading state - shows spinner and disables interaction */
  isLoading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Icon to display before text */
  iconBefore?: ReactNode;
  /** Icon to display after text */
  iconAfter?: ReactNode;
  children: ReactNode;
}

/**
 * Button Component
 * 
 * Enterprise-grade button with variants, loading states, and full accessibility.
 * Supports keyboard navigation and screen readers.
 * 
 * @example
 * <Button variant="primary" size="md">Get Started</Button>
 * <Button variant="secondary" isLoading>Processing...</Button>
 */
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  iconBefore,
  iconAfter,
  disabled,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    isLoading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className={styles.spinner} aria-hidden="true">
          <span className={styles.spinnerCircle}></span>
        </span>
      )}
      {!isLoading && iconBefore && (
        <span className={styles.icon} aria-hidden="true">
          {iconBefore}
        </span>
      )}
      <span className={styles.label}>{children}</span>
      {!isLoading && iconAfter && (
        <span className={styles.icon} aria-hidden="true">
          {iconAfter}
        </span>
      )}
    </button>
  );
}
