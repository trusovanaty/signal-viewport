/**
 * Scroll reveals, the same language as the author's site: a section's content rises a little and fades in once, in a short
 * stagger, while the line at the top of the section draws itself from the left (the styles are in `motion.css`).
 *
 * The page is fully visible until this runs, and it does nothing at all when the visitor asks for reduced motion or the
 * browser has no IntersectionObserver. Each section is revealed once and never hidden again.
 */
export function initReveal(): () => void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return () => undefined;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => undefined;

  const sections = Array.from(document.querySelectorAll<HTMLElement>('.sc-section, .sc-footer'));
  const marked: HTMLElement[] = [];
  for (const section of sections) {
    section.setAttribute('data-rv', '');
    // Only a section that already has a line on top gets the line that draws itself (the dark bands have none).
    if (parseFloat(getComputedStyle(section).borderTopWidth) > 0) section.setAttribute('data-rv-line', '');
    Array.from(section.children).forEach((child, i) => {
      const item = child as HTMLElement;
      item.classList.add('rv-item');
      item.style.setProperty('--d', String(Math.min(i, 4) * 90));
      marked.push(item);
    });
  }
  document.documentElement.classList.add('js-reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
  );
  sections.forEach((section) => observer.observe(section));

  return () => {
    observer.disconnect();
    document.documentElement.classList.remove('js-reveal');
    sections.forEach((section) => {
      section.removeAttribute('data-rv');
      section.removeAttribute('data-rv-line');
    });
    marked.forEach((item) => {
      item.classList.remove('rv-item');
      item.style.removeProperty('--d');
    });
  };
}
