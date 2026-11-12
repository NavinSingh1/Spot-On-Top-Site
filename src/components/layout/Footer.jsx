import { ArrowUp } from 'lucide-react';
import { FOOTER_LINKS } from '../../config/navigation';
import { API_CONFIG } from '../../config/api.config';
import { scrollToSection, scrollToTop } from '../../utils/scroll';
import { Container } from '../ui/Container';
import { Logo } from '../ui/Logo';

export function Footer() {
  return (
    <footer className="bg-ink-950 pb-[env(safe-area-inset-bottom,0px)]">
      <Container className="pt-14 lg:pt-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <Logo />
            <p className="mt-5 text-[15px] leading-relaxed text-fg-muted">
              A billboard-style ad marketplace connecting brands with audiences across India and the USA.
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-4 sm:grid-cols-4 lg:flex lg:gap-x-8 lg:pt-9 xl:gap-x-12 2xl:gap-x-24">
              {FOOTER_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={(event) => {
                      event.preventDefault();
                      scrollToSection(link.id);
                    }}
                    className="whitespace-nowrap text-[15px] font-semibold text-fg-muted transition-colors hover:text-fg"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-line py-6 text-[13px] text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© 2025 Spot On Top · Be seen on top.</p>
          <p>{API_CONFIG.useDemoData ? 'Redesign draft · All data is placeholder demo content' : 'Live data'}</p>
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 self-start rounded-md font-semibold transition-colors hover:text-fg sm:self-auto"
          >
            Back to top
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </Container>
    </footer>
  );
}
