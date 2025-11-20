import { Container } from '../components/layout/Container';
import { Card } from '../components/ui/Card';

const services = [
  {
    title: 'Web Development',
    description: 'Custom websites and web applications built with React, TypeScript, and modern best practices. Scalable architecture for enterprise needs.',
    tags: ['React', 'TypeScript', 'Node.js', 'AWS'],
  },
  {
    title: 'Design Systems', 
    description: 'Comprehensive design systems that unify your brand and accelerate development. Component libraries, documentation, and governance.',
    tags: ['Figma', 'Storybook', 'Documentation'],
  },
  {
    title: 'Automation (n8n)',
    description: 'Workflow automation that connects your tools and eliminates repetitive tasks. Custom integrations and efficiency improvements.',
    tags: ['n8n', 'APIs', 'Integration'],
  },
  {
    title: 'UI/UX Design',
    description: 'User-centered design that balances beauty and function. Wireframing, prototyping, and high-fidelity designs.',
    tags: ['Figma', 'User Research', 'Prototyping'],
  },
  {
    title: 'Technical Consulting',
    description: 'Strategic guidance for technology decisions. Architecture reviews, stack selection, and implementation planning.',
    tags: ['Strategy', 'Architecture', 'Planning'],
  },
  {
    title: 'Performance Optimization',
    description: 'Speed improvements that drive results. Core Web Vitals optimization, bundle analysis, and infrastructure tuning.',
    tags: ['Performance', 'Analytics', 'Optimization'],
  },
];

export function Services() {
  return (
    <div style={{ paddingTop: 'var(--space-xxl)', paddingBottom: 'var(--space-xxl)' }}>
      <Container>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xxl)' }}>
          <h1 style={{ fontSize: 'var(--fs-xxl)', marginBottom: 'var(--space-md)' }}>Our Services</h1>
          <p style={{ fontSize: 'var(--fs-md)', color: 'var(--color-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Specialized digital services designed for modern businesses that value quality and results.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-lg)' }}>
          {services.map((service) => (
            <Card
              key={service.title}
              title={service.title}
              description={service.description}
              tags={service.tags}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
