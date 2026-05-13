/* =========================================================================
   Aguacatech, Site interactivity
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

    // Feature carousel. Cross-fade slides + caption swap, dots, arrows, keyboard, touch, and auto-advance.
    const carousel = document.getElementById('carousel');
    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
        const dotsEl = carousel.querySelector('#carouselDots');
        const captionEl = carousel.querySelector('.carousel-caption');
        const eyebrowEl = carousel.querySelector('#carouselEyebrow');
        const titleEl = carousel.querySelector('#carouselTitle');
        const descEl = carousel.querySelector('#carouselDesc');
        const counterEl = carousel.querySelector('#carouselCounter');
        const winTitleEl = carousel.querySelector('#carouselWinTitle');
        const prevBtn = carousel.querySelector('#carouselPrev');
        const nextBtn = carousel.querySelector('#carouselNext');
        const track = carousel.querySelector('.carousel-track');

        let active = 0;
        let auto = null;
        let userInteracted = false;
        const AUTO_MS = 6000;

        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'carousel-dot' + (i === 0 ? ' is-active' : '');
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', 'Go to screenshot ' + (i + 1));
            dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
            dot.addEventListener('click', () => { stopAuto(); go(i); });
            dotsEl.appendChild(dot);
        });
        const dots = Array.from(dotsEl.children);

        function go(target) {
            const next = ((target % slides.length) + slides.length) % slides.length;
            if (next === active) return;
            const prev = active;
            active = next;

            slides[prev].classList.remove('is-active');
            slides[prev].classList.add('is-leaving');
            slides[next].classList.add('is-active');
            window.setTimeout(() => slides[prev].classList.remove('is-leaving'), 420);

            dots.forEach((d, idx) => {
                d.classList.toggle('is-active', idx === next);
                d.setAttribute('aria-selected', idx === next ? 'true' : 'false');
            });

            captionEl.classList.add('is-swapping');
            window.setTimeout(() => {
                const s = slides[next];
                eyebrowEl.textContent = s.dataset.eyebrow || '';
                titleEl.textContent = s.dataset.title || '';
                descEl.textContent = s.dataset.desc || '';
                if (winTitleEl) winTitleEl.textContent = s.dataset.window || '';
                counterEl.textContent = (next + 1) + ' / ' + slides.length;
                captionEl.classList.remove('is-swapping');
            }, 160);
        }

        function nextSlide() { go(active + 1); }
        function prevSlide() { go(active - 1); }

        function stopAuto() {
            userInteracted = true;
            if (auto) { window.clearInterval(auto); auto = null; }
        }
        function startAuto() {
            if (userInteracted || auto) return;
            auto = window.setInterval(nextSlide, AUTO_MS);
        }
        function pauseAuto() {
            if (auto) { window.clearInterval(auto); auto = null; }
        }

        prevBtn.addEventListener('click', () => { stopAuto(); prevSlide(); });
        nextBtn.addEventListener('click', () => { stopAuto(); nextSlide(); });

        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); stopAuto(); prevSlide(); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); stopAuto(); nextSlide(); }
        });

        let touchX = 0, touchY = 0;
        track.addEventListener('touchstart', (e) => {
            touchX = e.touches[0].clientX;
            touchY = e.touches[0].clientY;
        }, { passive: true });
        track.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - touchX;
            const dy = e.changedTouches[0].clientY - touchY;
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
                stopAuto();
                if (dx < 0) nextSlide(); else prevSlide();
            }
        }, { passive: true });

        carousel.addEventListener('mouseenter', pauseAuto);
        carousel.addEventListener('mouseleave', () => { if (!userInteracted) startAuto(); });
        carousel.addEventListener('focusin', pauseAuto);
        carousel.addEventListener('focusout', () => { if (!userInteracted) startAuto(); });

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if ('IntersectionObserver' in window && !reduceMotion) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) startAuto();
                    else pauseAuto();
                });
            }, { threshold: 0.4 });
            io.observe(carousel);
        }
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
