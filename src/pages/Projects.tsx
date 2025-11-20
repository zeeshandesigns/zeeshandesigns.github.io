import { useState } from 'react';
import { Container } from '../components/layout/Container';
import { Card } from '../components/ui/Card';

const projects = [
  {
    title: 'Enterprise SaaS Platform',
    description: 'Full-stack platform serving 10,000+ users with React, Node.js, PostgreSQL. Scalable architecture with microservices.',
    tags: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
    image: '/assets/images/project-1.jpg',
  },
  {
    title: 'Design System Implementation',
    description: 'Comprehensive design system for 15+ product teams. 40% faster development with reusable components.',
    tags: ['Figma', 'Storybook', 'React', 'TypeScript'],
    image: '/assets/images/project-2.jpg',
  },
  {
    title: 'Automation Workflow Suite',
    description: 'n8n workflows processing 100K+ events daily. Integration with CRM, email, and analytics platforms.',
    tags: ['n8n', 'APIs', 'Integration', 'Automation'],
    image: '/assets/images/project-3.jpg',
  },
  {
    title: 'E-commerce Platform Redesign',
    description: 'Complete UX overhaul increasing conversion by 35%. Mobile-first design with accessibility focus.',
    tags: ['Figma', 'React', 'A/B Testing', 'Conversion'],
    image: '/assets/images/project-4.jpg',
  },
  {
    title: 'Healthcare Dashboard',
    description: 'HIPAA-compliant dashboard for patient data visualization. Real-time updates with WebSocket integration.',
    tags: ['React', 'TypeScript', 'WebSocket', 'Security'],
    image: '/assets/images/project-5.jpg',
  },
  {
    title: 'Financial Analytics Tool',
    description: 'Real-time financial data visualization for investment decisions. D3.js charts with custom interactions.',
    tags: ['React', 'D3.js', 'Real-time', 'Analytics'],
    image: '/assets/images/project-6.jpg',
  },
];

const allTags = Array.from(new Set(projects.flatMap((p) => p.tags)));

export function Projects() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredProjects = selectedTag
    ? projects.filter((p) => p.tags.includes(selectedTag))
    : projects;

  return (
    <div style={{ paddingTop: 'var(--space-xxl)', paddingBottom: 'var(--space-xxl)' }}>
      <Container>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xxl)' }}>
          <h1 style={{ fontSize: 'var(--fs-xxl)', marginBottom: 'var(--space-md)' }}>Our Work</h1>
          <p style={{ fontSize: 'var(--fs-md)', color: 'var(--color-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Case studies and examples from our recent projects
          </p>
        </div>

        {/* Filter Tags */}
        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 'var(--space-xl)' }}>
          <button
            onClick={() => setSelectedTag(null)}
            style={{
              padding: 'var(--space-sm) var(--space-md)',
              background: !selectedTag ? 'var(--color-accent)' : 'var(--color-surface)',
              color: !selectedTag ? 'var(--color-text-inverse)' : 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: 'var(--fs-sm)',
              fontWeight: 'var(--fw-medium)',
            }}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              style={{
                padding: 'var(--space-sm) var(--space-md)',
                background: selectedTag === tag ? 'var(--color-accent)' : 'var(--color-surface)',
                color: selectedTag === tag ? 'var(--color-text-inverse)' : 'var(--color-text)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: 'var(--fs-sm)',
                fontWeight: 'var(--fw-medium)',
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-lg)' }}>
          {filteredProjects.map((project) => (
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
      </Container>
    </div>
  );
}
