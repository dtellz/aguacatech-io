/* =========================================================================
   Aguacatech — Site interactivity
   ========================================================================= */

(function () {
    // Nav drop-shadow on scroll.
    const nav = document.getElementById('nav');
    if (nav) {
        const onScroll = () => {
            if (window.scrollY > 8) nav.classList.add('is-scrolled');
            else nav.classList.remove('is-scrolled');
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Reveal-on-scroll for .reveal elements.
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        io.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
        );
        reveals.forEach((el) => io.observe(el));
    } else {
        reveals.forEach((el) => el.classList.add('is-visible'));
    }

    // Mobile-nav toggle. Renders a small overlay menu.
    const toggle = document.getElementById('navToggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            const existing = document.getElementById('mobileMenu');
            if (existing) {
                existing.remove();
                return;
            }
            const menu = document.createElement('div');
            menu.id = 'mobileMenu';
            menu.style.cssText = `
                position: fixed; inset: 64px 0 0 0; background: rgba(7, 9, 10, 0.96);
                backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
                z-index: 99; padding: 32px; display: flex; flex-direction: column; gap: 24px;
                font-size: 24px; font-weight: 600;
            `;
            menu.innerHTML = `
                <a href="/#features">Features</a>
                <a href="/#pricing">Pricing</a>
                <a href="/#faq">FAQ</a>
                <a href="/privacy.html">Privacy</a>
                <a href="/download.html">Download</a>
                <a href="/buy.html">Buy</a>
            `;
            menu.querySelectorAll('a').forEach((a) => {
                a.style.color = 'var(--text-primary)';
                a.addEventListener('click', () => menu.remove());
            });
            document.body.appendChild(menu);
        });
    }
})();
