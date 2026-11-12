function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/** Smoothly scrolls to a section by id and keeps the URL hash in sync. */
export function scrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  if (window.location.hash !== `#${id}`) {
    window.history.replaceState(null, '', `#${id}`);
  }
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
}
