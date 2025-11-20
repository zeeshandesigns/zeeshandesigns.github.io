import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MenuIcon, CloseIcon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { Container } from './Container';
import styles from './Header.module.css';

const navLinks = [
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

/**
 * Header Component
 * 
 * Sticky navigation header with logo, nav links, and mobile menu.
 * Fully accessible with keyboard navigation and ARIA attributes.
 */
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.inner}>
          {/* Logo */}
          <Link to="/" className={styles.logo} onClick={closeMobileMenu}>
            <span className={styles.logoText}>Zynk</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.desktopNav} aria-label="Main navigation">
            <ul className={styles.navList}>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className={styles.navLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* CTA Button (Desktop) */}
          <div className={styles.cta}>
            <Button variant="primary" size="md" asChild>
              <Link to="/contact">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={styles.mobileMenuButton}
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </Container>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu} role="dialog" aria-modal="true">
          <Container>
            <nav aria-label="Mobile navigation">
              <ul className={styles.mobileNavList}>
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className={styles.mobileNavLink}
                      onClick={closeMobileMenu}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className={styles.mobileCta}>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={closeMobileMenu}
                  asChild
                >
                  <Link to="/contact">Get Started</Link>
                </Button>
              </div>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}
