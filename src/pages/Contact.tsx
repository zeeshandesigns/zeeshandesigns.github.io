import { FormEvent, useState } from 'react';
import { Container } from '../components/layout/Container';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement form submission
    // Options: Formspree, EmailJS, or backend API
    // For now, just simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', company: '', message: '' });
    }, 1500);
  };

  return (
    <div style={{ paddingTop: 'var(--space-xxl)', paddingBottom: 'var(--space-xxl)' }}>
      <Container maxWidth="md">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xxl)' }}>
          <h1 style={{ fontSize: 'var(--fs-xxl)', marginBottom: 'var(--space-md)' }}>Get in Touch</h1>
          <p style={{ fontSize: 'var(--fs-md)', color: 'var(--color-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Have a project in mind? Let's discuss how we can help you achieve your goals.
          </p>
        </div>

        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <Input
              label="Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
              placeholder="Your name"
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              fullWidth
              placeholder="you@company.com"
            />

            <Input
              label="Company"
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              fullWidth
              placeholder="Your company (optional)"
            />

            <Textarea
              label="Message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              fullWidth
              rows={6}
              placeholder="Tell us about your project..."
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
            >
              Send Message
            </Button>

            {submitStatus === 'success' && (
              <div style={{ padding: 'var(--space-md)', background: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                Thank you! We'll get back to you soon.
              </div>
            )}

            {submitStatus === 'error' && (
              <div style={{ padding: 'var(--space-md)', background: 'var(--color-danger-light)', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                Something went wrong. Please try again.
              </div>
            )}
          </form>

          <div style={{ marginTop: 'var(--space-xxl)', padding: 'var(--space-xl)', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--space-md)' }}>Other Ways to Reach Us</h2>
            <p style={{ fontSize: 'var(--fs-base)', marginBottom: 'var(--space-sm)' }}>
              <strong>Email:</strong> <a href="mailto:hello@zynk.digital" style={{ color: 'var(--color-accent)' }}>hello@zynk.digital</a>
            </p>
            <p style={{ fontSize: 'var(--fs-base)', color: 'var(--color-muted)' }}>
              We typically respond within 24 hours
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
