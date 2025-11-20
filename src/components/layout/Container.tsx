import { ReactNode } from 'react';
import styles from './Container.module.css';

export interface ContainerProps {
  children: ReactNode;
  /** Maximum width constraint */
  maxWidth?: 'sm' | 'md' | 'lg' | 'full';
  /** Additional padding */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Container Component
 * 
 * Responsive container with consistent horizontal padding and max-width.
 * Centers content and maintains layout consistency across pages.
 * 
 * @example
 * <Container maxWidth="lg">
 *   <Hero />
 * </Container>
 */
export function Container({
  children,
  maxWidth = 'lg',
  padding = 'md',
  className = '',
}: ContainerProps) {
  const classNames = [
    styles.container,
    styles[`maxWidth-${maxWidth}`],
    styles[`padding-${padding}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classNames}>{children}</div>;
}
