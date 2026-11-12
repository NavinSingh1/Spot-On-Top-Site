import { useEffect } from 'react';
import { Footer } from './components/layout/Footer';
import { Navbar } from './components/layout/Navbar';
import { AppProviders } from './context/AppProviders';
import { HomePage } from './pages/HomePage';

/** Honour a #section in the URL on first load (e.g. shared links to #pricing). */
function useInitialHashScroll() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return undefined;
    const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, []);
}

export default function App() {
  useInitialHashScroll();

  return (
    <AppProviders>
      <a
        href="#main"
        className="sr-only z-[100] rounded-lg bg-gold px-4 py-2 font-bold text-navy focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <HomePage />
      </main>
      <Footer />
    </AppProviders>
  );
}
