import { useEffect, useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { NAV_LINKS } from '../../config/navigation';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { cn } from '../../utils/cn';
import { CURRENCIES } from '../../utils/currency';
import { scrollToSection, scrollToTop } from '../../utils/scroll';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { Logo } from '../ui/Logo';

/** Every section in page order, so the spy knows where the reader is. */
const SECTION_ORDER = [
  'how-it-works',
  'spots',
  'live-traffic',
  'banner-board',
  'brands',
  'banner-panel',
  'community-pick',
  'pricing',
  'quote-builder',
  'faq',
  'join',
];

function CurrencyToggle({ className }) {
  const { currency, setCurrency } = useSettings();
  return (
    <div
      role="radiogroup"
      aria-label="Display currency"
      className={cn('inline-flex h-11 items-center gap-1 rounded-lg border border-line p-1', className)}
    >
      {CURRENCIES.map((option) => {
        const selected = option.value === currency;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setCurrency(option.value)}
            className={cn(
              'h-full rounded-md px-2.5 text-[11px] font-extrabold tracking-wide transition-colors',
              selected ? 'bg-fg text-ink-950' : 'text-fg-muted hover:text-fg',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useSettings();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
      className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line text-fg transition-colors hover:border-line-strong hover:bg-ink-800/60"
    >
      {isDark ? <Sun className="h-[18px] w-[18px]" aria-hidden="true" /> : <Moon className="h-[18px] w-[18px]" aria-hidden="true" />}
    </button>
  );
}

export function Navbar() {
  const activeId = useScrollSpy(SECTION_ORDER);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && setMenuOpen(false);
    const onResize = () => window.innerWidth >= 1280 && setMenuOpen(false);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [menuOpen]);

  const goTo = (id) => (event) => {
    event.preventDefault();
    setMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top,0px)]">
      <Container className="pt-3 lg:pt-4">
        <nav
          aria-label="Main"
          className={cn(
            'flex h-16 items-center justify-between gap-4 rounded-2xl border px-3 transition-[background-color,border-color,box-shadow] duration-300 sm:px-4 lg:h-[76px] lg:px-5',
            scrolled || menuOpen
              ? 'border-line-strong/70 bg-ink-950/85 shadow-card backdrop-blur-xl'
              : 'border-line/80 bg-ink-950/40 backdrop-blur-md',
          )}
        >
          <a
            href="#top"
            onClick={(event) => {
              event.preventDefault();
              setMenuOpen(false);
              scrollToTop();
            }}
            className="rounded-md px-1 py-1"
            aria-label="Spot On Top, back to top"
          >
            <Logo />
          </a>

          <ul className="hidden items-center gap-1 xl:flex 2xl:gap-3">
            {NAV_LINKS.map((link) => {
              const active = activeId === link.id;
              return (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={goTo(link.id)}
                    aria-current={active ? 'location' : undefined}
                    className={cn(
                      'relative rounded-md px-3 py-2 text-[15px] font-medium transition-colors',
                      active ? 'text-fg' : 'text-fg-muted hover:text-fg',
                    )}
                  >
                    {link.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded-full bg-gold transition-transform duration-300',
                        active ? 'scale-x-100' : 'scale-x-0',
                      )}
                    />
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <CurrencyToggle className="hidden sm:inline-flex" />
            <ThemeToggle />
            <Button size="md" className="hidden h-11 sm:inline-flex" onClick={() => scrollToSection('banner-board')}>
              Book a slot
            </Button>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line text-fg transition-colors hover:bg-ink-800/60 xl:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div
            id="mobile-menu"
            className="mt-2 max-h-[calc(100dvh-6rem)] animate-scale-in overflow-y-auto rounded-2xl border border-line-strong/70 bg-ink-950/95 p-3 shadow-card backdrop-blur-xl xl:hidden"
          >
            <ul className="grid gap-1 sm:grid-cols-2">
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={goTo(link.id)}
                    className={cn(
                      'flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold transition-colors',
                      activeId === link.id ? 'bg-ink-800 text-fg' : 'text-fg-muted hover:bg-ink-800/60 hover:text-fg',
                    )}
                  >
                    {link.label}
                    {activeId === link.id && <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center gap-2 border-t border-line pt-3 sm:hidden">
              <CurrencyToggle />
              <Button className="h-11 flex-1" onClick={goTo('banner-board')}>
                Book a slot
              </Button>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
