import { ReactNode } from 'react';
import styles from './Card.module.css';

export interface CardProps {
  /** Optional image URL */
  image?: string;
  /** Image alt text for accessibility */
  imageAlt?: string;
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** Optional array of tags */
  tags?: string[];
  /** Optional CTA button text */
  ctaText?: string;
  /** Optional CTA click handler */
  onCtaClick?: () => void;
  /** Optional href for card link */
  href?: string;
  /** Custom content for card footer */
  footer?: ReactNode;
  className?: string;
}

/**
 * Card Component
 * 
 * Flexible card component for services, projects, and content blocks.
 * Supports images, tags, and clickable CTAs.
 * 
 * @example
 * <Card
 *   title="Web Development"
 *   description="Custom websites built with modern tech"
 *   tags={['React', 'TypeScript']}
 *   ctaText="Learn more"
 *   href="/services/web-dev"
 * />
 */
export function Card({
  image,
  imageAlt,
  title,
  description,
  tags,
  ctaText,
  onCtaClick,
  href,
  footer,
  className = '',
}: CardProps) {
  const CardWrapper = href ? 'a' : 'div';
  const wrapperProps = href
    ? { href, className: `${styles.card} ${styles.clickable} ${className}` }
    : { className: `${styles.card} ${className}` };

  return (
    <CardWrapper {...wrapperProps}>
      {image && (
        <div className={styles.imageWrapper}>
          <img
            src={image}
            alt={imageAlt || title}
            className={styles.image}
            loading="lazy"
          />
        </div>
      )}
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        {tags && tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
        {ctaText && (
          <button
            className={styles.cta}
            onClick={onCtaClick}
            aria-label={`${ctaText} - ${title}`}
          >
            {ctaText}
            <span className={styles.arrow} aria-hidden="true">
              →
            </span>
          </button>
        )}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </CardWrapper>
  );
}
