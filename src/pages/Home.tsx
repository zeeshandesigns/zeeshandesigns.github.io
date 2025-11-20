import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ArrowRightIcon, CheckIcon } from '../components/ui/Icon';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';

const featuredServices = [
  {
    title: 'Web Development',
    description:
      'Custom websites and web applications built with modern frameworks. React, TypeScript, and enterprise-grade architecture.',
    tags: ['React', 'TypeScript', 'Vite'],
  },
  {
    title: 'Design Systems',
    description:
      'Scalable design systems that maintain brand consistency and accelerate development across your organization.',
    tags: ['Figma', 'Component Libraries', 'Documentation'],
  },
  {
    title: 'Automation (n8n)',
    description:
      'Workflow automation that connects your tools and eliminates repetitive tasks. Custom n8n solutions for efficiency.',
    tags: ['n8n', 'Integration', 'Efficiency'],
  },
];

const highlightProjects = [
  {
    title: 'Enterprise SaaS Platform',
    description:
      'Full-stack platform serving 10,000+ users with 99.9% uptime. Built with React, Node.js, and PostgreSQL.',
    tags: ['React', 'Node.js', 'AWS'],
    image: '/assets/images/project-1.jpg',
  },
  {
    title: 'Design System Implementation',
    description:
      'Comprehensive design system adopted across 15+ product teams. Reduced development time by 40%.',
    tags: ['Figma', 'Storybook', 'React'],
    image: '/assets/images/project-2.jpg',
  },
  {
    title: 'Automation Workflow Suite',
    description:
      'n8n workflows processing 100K+ events daily. Integrated CRM, email, and analytics platforms.',
    tags: ['n8n', 'APIs', 'Integration'],
    image: '/assets/images/project-3.jpg',
  },
];

const values = [
  'Enterprise-grade code quality',
  'Accessibility as standard (WCAG AA)',
  'Scalable, maintainable architecture',
  'Clear communication and documentation',
  'Performance-first approach',
  'Security and compliance built-in',
];

export function Home() {
  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <Container>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                Enterprise Digital Services for Modern Businesses
              </h1>
              <p className={styles.heroDescription}>
                We deliver high-trust digital experiences through expert web
                development, design systems, and automation. Built for scale,
                designed for clarity.
              </p>
              <div className={styles.heroCtas}>
                <Button variant="primary" size="lg" asChild>
                  <Link to="/contact">Start a Project</Link>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/projects">View Our Work</Link>
                </Button>
              </div>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.heroImage}>
                {/* Placeholder for illustration/graphic */}
                <div className={styles.placeholder}></div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Services Section */}
      <section className={styles.services}>
        <Container>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>What We Do</h2>
            <p className={styles.sectionDescription}>
              Specialized services designed for enterprise needs
            </p>
          </div>
          <div className={styles.servicesGrid}>
            {featuredServices.map((service) => (
              <Card
                key={service.title}
                title={service.title}
                description={service.description}
                tags={service.tags}
                ctaText="Learn more"
              />
            ))}
          </div>
          <div className={styles.sectionCta}>
            <Button variant="ghost" size="md" iconAfter={<ArrowRightIcon />} asChild>
              <Link to="/services">All Services</Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* Why Zynk Section */}
      <section className={styles.whyZynk}>
        <Container>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Why Zynk</h2>
            <p className={styles.sectionDescription}>
              Built on principles that deliver results
            </p>
          </div>
          <div className={styles.valuesGrid}>
            {values.map((value) => (
              <div key={value} className={styles.valueItem}>
                <CheckIcon size={20} className={styles.valueIcon} />
                <span>{value}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Projects Section */}
      <section className={styles.projects}>
        <Container>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Work</h2>
            <p className={styles.sectionDescription}>
              Case studies from our latest projects
            </p>
          </div>
          <div className={styles.projectsGrid}>
            {highlightProjects.map((project) => (
              <Card
                key={project.title}
                title={project.title}
                description={project.description}
                tags={project.tags}
                image={project.image}
                imageAlt={project.title}
              />
            ))}
          </div>
          <div className={styles.sectionCta}>
            <Button variant="ghost" size="md" iconAfter={<ArrowRightIcon />} asChild>
              <Link to="/projects">View All Projects</Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <Container>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to build something great?</h2>
            <p className={styles.ctaDescription}>
              Let's discuss your project and how we can help you achieve your
              goals.
            </p>
            <Button variant="primary" size="lg" asChild>
              <Link to="/contact">Get in Touch</Link>
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
