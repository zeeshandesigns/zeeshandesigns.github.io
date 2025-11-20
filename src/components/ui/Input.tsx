import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label text for the input */
  label?: string;
  /** Helper text displayed below input */
  helperText?: string;
  /** Error message - displays in red and sets aria-invalid */
  error?: string;
  /** Icon to display at start of input */
  iconBefore?: ReactNode;
  /** Icon to display at end of input */
  iconAfter?: ReactNode;
  /** Full width input */
  fullWidth?: boolean;
}

/**
 * Input Component
 * 
 * Accessible text input with label, helper text, error states, and icon support.
 * Automatically links label and error messages for screen readers.
 * 
 * @example
 * <Input
 *   label="Email address"
 *   type="email"
 *   helperText="We'll never share your email"
 *   required
 * />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      iconBefore,
      iconAfter,
      fullWidth = false,
      className = '',
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    // Generate unique IDs for accessibility
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const helperTextId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const wrapperClasses = [
      styles.wrapper,
      fullWidth && styles.fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const inputClasses = [
      styles.input,
      error && styles.inputError,
      iconBefore && styles.hasIconBefore,
      iconAfter && styles.hasIconAfter,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && <span className={styles.required} aria-label="required">*</span>}
          </label>
        )}
        <div className={styles.inputWrapper}>
          {iconBefore && (
            <span className={styles.iconBefore} aria-hidden="true">
              {iconBefore}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={
              error ? errorId : helperText ? helperTextId : undefined
            }
            {...props}
          />
          {iconAfter && (
            <span className={styles.iconAfter} aria-hidden="true">
              {iconAfter}
            </span>
          )}
        </div>
        {error && (
          <p id={errorId} className={styles.error} role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperTextId} className={styles.helperText}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
