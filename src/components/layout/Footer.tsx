import { Link } from 'react-router-dom';
import { Container } from './Container';
import { LinkedInIcon, TwitterIcon, GitHubIcon } from '../ui/Icon';
import styles from './Footer.module.css';

const footerLinks = {
  services: [
    { label: 'Web Development', href: '/services#web-dev' },
    { label: 'Design Systems', href: '/services#design' },
    { label: 'Automation (n8n)', href: '/services#automation' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Projects', href: '/projects' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

const socialLinks = [
  { label: 'LinkedIn', href: '#', icon: LinkedInIcon },
  { label: 'Twitter', href: '#', icon: TwitterIcon },
  { label: 'GitHub', href: '#', icon: GitHubIcon },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              Zynk
            </Link>
            <p className={styles.tagline}>
              Enterprise-grade digital services. Design, automation, and
              development.
            </p>
            <div className={styles.social}>
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={styles.socialLink}
                  aria-label={link.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <link.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Services</h3>
            <ul className={styles.linkList}>
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Company</h3>
            <ul className={styles.linkList}>
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Legal</h3>
            <ul className={styles.linkList}>
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Zynk. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
