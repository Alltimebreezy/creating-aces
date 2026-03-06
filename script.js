/* ============================================
   ADJAN – Interactions
   Hero, carousels, tabs, hover effects
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // === Header scroll: transparent → white ===
    const header = document.getElementById('header');

    const onScroll = () => {
        header.classList.toggle('scrolled', window.scrollY > 60);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // === Mobile menu ===
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = mobileMenu.querySelectorAll('.mobile-link');

    const toggleMenu = () => {
        navToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    };

    navToggle.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => link.addEventListener('click', toggleMenu));

    // === Smooth scroll ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const top = target.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // === Scroll reveal ===
    const reveals = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => revealObserver.observe(el));

    // === Trust counter animation ===
    const counters = document.querySelectorAll('.trust-num[data-target]');

    const animateCounter = (el) => {
        const target = parseInt(el.dataset.target);
        const duration = 1500;
        const start = performance.now();
        const ease = (t) => 1 - Math.pow(1 - t, 3);

        const update = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            el.textContent = Math.round(ease(progress) * target);
            if (progress < 1) requestAnimationFrame(update);
        };

        requestAnimationFrame(update);
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));

    // === Process tabs (Squarespace-style) ===
    const processTabs = document.querySelectorAll('.process-tab');
    const processSlides = document.querySelectorAll('.process-slide');
    const procCurrent = document.getElementById('procCurrent');
    const procPrev = document.querySelector('.proc-prev');
    const procNext = document.querySelector('.proc-next');
    let currentStep = 0;

    const showStep = (index) => {
        if (index < 0 || index >= processSlides.length) return;
        currentStep = index;

        processTabs.forEach(t => t.classList.remove('active'));
        processSlides.forEach(s => s.classList.remove('active'));

        processTabs[index].classList.add('active');
        processSlides[index].classList.add('active');

        if (procCurrent) procCurrent.textContent = index + 1;

        // Scroll active tab into view on mobile
        processTabs[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    };

    processTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            showStep(parseInt(tab.dataset.step));
        });
    });

    if (procPrev) procPrev.addEventListener('click', () => showStep(currentStep - 1));
    if (procNext) procNext.addEventListener('click', () => showStep(currentStep + 1));

    // === Portfolio carousel (Squarespace-style) ===
    const track = document.getElementById('portfolioTrack');
    const pfPrev = document.querySelector('.pf-prev');
    const pfNext = document.querySelector('.pf-next');
    let pfIndex = 0;
    let pfDragging = false;
    let pfStartX = 0;
    let pfCurrentTranslate = 0;
    let pfPrevTranslate = 0;

    const getSlideWidth = () => {
        const slide = track?.querySelector('.portfolio-slide');
        if (!slide) return 0;
        const gap = 28;
        return slide.offsetWidth + gap;
    };

    const getMaxIndex = () => {
        if (!track) return 0;
        const slides = track.querySelectorAll('.portfolio-slide');
        const visibleWidth = track.parentElement.offsetWidth;
        const slideWidth = getSlideWidth();
        const totalWidth = slideWidth * slides.length - 28;
        return Math.max(0, Math.ceil((totalWidth - visibleWidth) / slideWidth));
    };

    const slideTo = (index) => {
        const max = getMaxIndex();
        pfIndex = Math.max(0, Math.min(index, max));
        const offset = pfIndex * getSlideWidth();
        pfCurrentTranslate = -offset;
        pfPrevTranslate = pfCurrentTranslate;
        track.style.transform = `translateX(${pfCurrentTranslate}px)`;
    };

    if (pfPrev) pfPrev.addEventListener('click', () => slideTo(pfIndex - 1));
    if (pfNext) pfNext.addEventListener('click', () => slideTo(pfIndex + 1));

    // Touch/drag support for portfolio carousel
    if (track) {
        const dragStart = (e) => {
            pfDragging = true;
            pfStartX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            track.classList.add('dragging');
        };

        const dragMove = (e) => {
            if (!pfDragging) return;
            const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const diff = currentX - pfStartX;
            pfCurrentTranslate = pfPrevTranslate + diff;
            track.style.transform = `translateX(${pfCurrentTranslate}px)`;
        };

        const dragEnd = () => {
            if (!pfDragging) return;
            pfDragging = false;
            track.classList.remove('dragging');

            const diff = pfCurrentTranslate - pfPrevTranslate;
            const threshold = getSlideWidth() * 0.2;

            if (diff < -threshold) {
                slideTo(pfIndex + 1);
            } else if (diff > threshold) {
                slideTo(pfIndex - 1);
            } else {
                slideTo(pfIndex);
            }
        };

        track.addEventListener('mousedown', dragStart);
        track.addEventListener('touchstart', dragStart, { passive: true });
        window.addEventListener('mousemove', dragMove);
        window.addEventListener('touchmove', dragMove, { passive: true });
        window.addEventListener('mouseup', dragEnd);
        window.addEventListener('touchend', dragEnd);

        // Prevent image drag
        track.querySelectorAll('img').forEach(img => {
            img.addEventListener('dragstart', (e) => e.preventDefault());
        });

        // Recalculate on resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => slideTo(pfIndex), 100);
        });
    }

    // === FAQ accordion ===
    document.querySelectorAll('.faq-item').forEach(item => {
        const btn = item.querySelector('.faq-q');
        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => {
                i.classList.remove('active');
                i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
            });
            if (!isOpen) {
                item.classList.add('active');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // === Testimonials slider ===
    const testimonials = document.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.t-dot');
    let current = 0;
    let interval;

    const show = (i) => {
        testimonials.forEach(t => t.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        testimonials[i].classList.add('active');
        dots[i].classList.add('active');
        current = i;
    };

    const next = () => show((current + 1) % testimonials.length);

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            clearInterval(interval);
            show(parseInt(dot.dataset.index));
            interval = setInterval(next, 6000);
        });
    });

    if (testimonials.length > 0) {
        interval = setInterval(next, 6000);
    }

    // === Contact form ===
    const form = document.getElementById('contactForm');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const original = btn.textContent;
            btn.textContent = 'Gesendet \u2713';
            btn.style.opacity = '0.7';
            setTimeout(() => {
                btn.textContent = original;
                btn.style.opacity = '';
                form.reset();
            }, 3000);
        });
    }

    // === Portfolio preview modal ===
    const modal = document.getElementById('previewModal');
    const frame = document.getElementById('previewFrame');
    const titleEl = document.getElementById('previewTitle');
    const closeBtn = document.getElementById('previewClose');
    const backdrop = modal ? modal.querySelector('.modal-backdrop') : null;

    const openPreview = (url, title) => {
        frame.src = url;
        titleEl.textContent = title;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closePreview = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => { frame.src = ''; }, 300);
    };

    document.querySelectorAll('.portfolio-slide[data-project]').forEach(item => {
        item.addEventListener('click', (e) => {
            // Only open if not dragging
            if (pfDragging) return;
            if (Math.abs(pfCurrentTranslate - pfPrevTranslate) > 5) return;
            e.preventDefault();
            const url = item.dataset.project;
            const name = item.querySelector('h3')?.textContent || 'Preview';
            openPreview(url, name);
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closePreview);
    if (backdrop) backdrop.addEventListener('click', closePreview);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('active')) {
            closePreview();
        }
    });
});
