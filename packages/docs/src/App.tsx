import React from 'react';
import { AppLayout } from './layouts/AppLayout';
import { Playground } from './components/Playground';
import { Button, Card } from '@finggu/react';

// Simplified Markdown renderer for the demo
const Section: React.FC<{ title: string; children: React.ReactNode; id?: string }> = ({ title, children, id }) => (
  <section id={id || title.toLowerCase().replace(' ', '-')} style={{ marginBottom: 'var(--ff-space-16)' }}>
    <h2 style={{ fontSize: '2rem', marginBottom: 'var(--ff-space-6)', color: 'var(--ff-primary)' }}>{title}</h2>
    <div style={{ lineHeight: 1.6, fontSize: '1.1rem' }}>
      {children}
    </div>
  </section>
);

function App() {
  return (
    <AppLayout>
      <Section title="Introduction" id="introduction">
        <p>FingguFlux is a architectural wrapper designed to solve the "CSS Drift" problem in large-scale applications. It forces a complete separation between <strong>Design Tokens</strong>, <strong>Component State</strong>, and <strong>CSS Production</strong>.</p>
        <Playground />
      </Section>

      <Section title="Philosophy" id="philosophy">
        <ul>
          <li><strong>Transparency as a Constraint</strong>: Components don't own styles, they own mappings.</li>
          <li><strong>Zero-Runtime</strong>: No CSS-in-JS overhead.</li>
          <li><strong>Deterministic Hardening</strong>: Extreme mode hashing for security.</li>
        </ul>
      </Section>

      <Section title="Token System" id="tokens">
        <p>Hierarchy matters. FingguFlux uses a strict multi-layer token system.</p>
        <Card padding="md" variant="default" style={{ margin: 'var(--ff-space-4) 0', backgroundColor: 'var(--ff-neutral-100)' }}>
          <code>--ff-primary: #3b82f6;</code><br />
          <code>--ff-surface: var(--ff-neutral-0);</code>
        </Card>
      </Section>

      <Section title="Motion" id="motion">
        <p>Subtle, accessible, and high-performance animations.</p>
        <div style={{ display: 'flex', gap: 'var(--ff-space-4)' }}>
          <Button variant="primary" motion="pop">Pop Animation</Button>
          <Button variant="secondary" motion="fade">Fade Animation</Button>
        </div>
      </Section>

      <Section title="Trust" id="trust">
        <p>FingguFlux is built for high-trust environments.</p>
        <Card padding="lg" variant="default">
          <strong>Benchmark:</strong> Core Layout only 2.8KB (Gzip).
        </Card>
      </Section>

      <footer style={{ marginTop: 'var(--ff-space-20)', padding: 'var(--ff-space-10)', borderTop: '1px solid var(--ff-neutral-200)', textAlign: 'center', opacity: 0.5 }}>
        © 2026 FingguFlux Architecture. Built with FingguFlux.
      </footer>
    </AppLayout>
  );
}

export default App;
