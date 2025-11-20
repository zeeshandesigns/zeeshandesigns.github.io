import { Container } from '../components/layout/Container';

export function About() {
  return (
    <div style={{ paddingTop: 'var(--space-xxl)', paddingBottom: 'var(--space-xxl)' }}>
      <Container maxWidth="md">
        <h1 style={{ fontSize: 'var(--fs-xxl)', marginBottom: 'var(--space-lg)', textAlign: 'center' }}>About Zynk</h1>
        
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <p style={{ fontSize: 'var(--fs-md)', lineHeight: 'var(--lh-relaxed)', marginBottom: 'var(--space-lg)' }}>
            Zynk is a digital services agency focused on delivering enterprise-grade solutions through web development, design systems, and automation.
          </p>
          
          <h2 style={{ fontSize: 'var(--fs-lg)', marginTop: 'var(--space-xxl)', marginBottom: 'var(--space-md)' }}>Our Mission</h2>
          <p style={{ fontSize: 'var(--fs-base)', lineHeight: 'var(--lh-relaxed)', marginBottom: 'var(--space-lg)' }}>
            We believe great digital products are built on three pillars: exceptional code quality, thoughtful design, and clear communication. Our mission is to help businesses scale through technology that's maintainable, accessible, and performant.
          </p>

          <h2 style={{ fontSize: 'var(--fs-lg)', marginTop: 'var(--space-xxl)', marginBottom: 'var(--space-md)' }}>Our Approach</h2>
          <ul style={{ fontSize: 'var(--fs-base)', lineHeight: 'var(--lh-relaxed)', marginLeft: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
            <li style={{ marginBottom: 'var(--space-sm)' }}>
              <strong>Quality First:</strong> We write clean, testable, well-documented code that teams can maintain and extend.
            </li>
            <li style={{ marginBottom: 'var(--space-sm)' }}>
              <strong>Accessibility Standard:</strong> WCAG AA compliance isn't optional—it's built into every component and page we create.
            </li>
            <li style={{ marginBottom: 'var(--space-sm)' }}>
              <strong>Performance Minded:</strong> Fast load times, efficient rendering, and optimized assets are non-negotiable.
            </li>
            <li style={{ marginBottom: 'var(--space-sm)' }}>
              <strong>Clear Communication:</strong> Regular updates, thorough documentation, and transparent timelines keep projects on track.
            </li>
          </ul>

          <h2 style={{ fontSize: 'var(--fs-lg)', marginTop: 'var(--space-xxl)', marginBottom: 'var(--space-md)' }}>Our Timeline</h2>
          <div style={{ borderLeft: '2px solid var(--color-border)', paddingLeft: 'var(--space-lg)', marginLeft: 'var(--space-md)' }}>
            <div style={{ marginBottom: 'var(--space-xl)' }}>
              <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 'var(--fw-semibold)', marginBottom: 'var(--space-xs)' }}>2023</h3>
              <p style={{ fontSize: 'var(--fs-base)', color: 'var(--color-muted)' }}>
                Founded Zynk with focus on React development and design systems
              </p>
            </div>
            <div style={{ marginBottom: 'var(--space-xl)' }}>
              <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 'var(--fw-semibold)', marginBottom: 'var(--space-xs)' }}>2024</h3>
              <p style={{ fontSize: 'var(--fs-base)', color: 'var(--color-muted)' }}>
                Expanded services to include n8n automation and workflow integration
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 'var(--fw-semibold)', marginBottom: 'var(--space-xs)' }}>2025</h3>
              <p style={{ fontSize: 'var(--fs-base)', color: 'var(--color-muted)' }}>
                Serving enterprise clients with complex technical needs
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
