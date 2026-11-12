import { cn } from '../../utils/cn';
import { Container } from './Container';

const TONES = {
  950: 'bg-ink-950',
  900: 'bg-ink-900',
  850: 'bg-ink-850',
  800: 'bg-ink-800',
};

export function Section({ id, tone = 900, className, containerClassName, children, ...props }) {
  return (
    <section id={id} className={cn('relative py-20 sm:py-24 lg:py-28', TONES[tone], className)} {...props}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
