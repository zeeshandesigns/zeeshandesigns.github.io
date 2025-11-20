import { TextareaHTMLAttributes, forwardRef } from 'react';
import styles from './Textarea.module.css';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label text for the textarea */
  label?: string;
  /** Helper text displayed below textarea */
  helperText?: string;
  /** Error message - displays in red and sets aria-invalid */
  error?: string;
  /** Full width textarea */
  fullWidth?: boolean;
}

/**
 * Textarea Component
 * 
 * Accessible multi-line text input with label, helper text, and error states.
 * Automatically links label and error messages for screen readers.
 * 
 * @example
 * <Textarea
 *   label="Message"
 *   rows={5}
 *   placeholder="Tell us about your project..."
 *   required
 * />
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      fullWidth = false,
      className = '',
      id,
      required,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    // Generate unique IDs for accessibility
    const textareaId =
      id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const helperTextId = `${textareaId}-helper`;
    const errorId = `${textareaId}-error`;

    const wrapperClasses = [
      styles.wrapper,
      fullWidth && styles.fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const textareaClasses = [styles.textarea, error && styles.textareaError]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={textareaId} className={styles.label}>
            {label}
            {required && (
              <span className={styles.required} aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={textareaClasses}
          disabled={disabled}
          required={required}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={
            error ? errorId : helperText ? helperTextId : undefined
          }
          {...props}
        />
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

Textarea.displayName = 'Textarea';
