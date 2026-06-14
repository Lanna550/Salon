/* ============================================================
   Salon A by Genie — JavaScript
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initSmoothScroll();
  initCardStack();
  initImageFallbacks();
});

/* ============================================================
   NAVBAR SCROLL BEHAVIOR
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  let ticking = false;

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          navbar.classList.toggle("scrolled", window.scrollY > 60);
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true },
  );
}

/* ============================================================
   MOBILE MENU
   ============================================================ */
function initMobileMenu() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");
  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    toggle.classList.add("is-active");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    toggle.classList.remove("is-active");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
  }

  toggle.addEventListener("click", () => {
    menu.classList.contains("is-open") ? closeMenu() : openMenu();
  });

  // Targetkan SEMUA tag <a> di dalam mobile menu
  const links = menu.querySelectorAll("a");
  links.forEach((link) => {
    link.addEventListener("click", () => {
      // Menu akan otomatis tertutup saat link apapun ditekan
      closeMenu();
    });
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) closeMenu();
  });

  // Close when clicking outside the navbar toggle area
  menu.addEventListener("click", (e) => {
    if (e.target === menu) closeMenu();
  });
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initScrollReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -30px 0px" },
  );

  els.forEach((el) => observer.observe(el));
}

/* ============================================================
   SMOOTH SCROLL
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--navbar-h",
          ),
        ) || 68;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: "smooth",
      });
    });
  });
}

/* ============================================================
   CARD STACK GALLERY
   ============================================================ */
function initCardStack() {
  const deck = document.getElementById("cardDeck");
  const prevBtn = document.getElementById("cardPrev");
  const nextBtn = document.getElementById("cardNext");
  const currentEl = document.getElementById("cardCurrent");
  const totalEl = document.getElementById("cardTotal");
  if (!deck) return;

  const cards = Array.from(deck.querySelectorAll(".cards__card"));
  const total = cards.length;
  let current = 0;

  if (totalEl) totalEl.textContent = total;

  function layout() {
    cards.forEach((card, i) => {
      const offset = i - current;

      if (offset < 0) {
        // Dismissed — fly left
        card.style.transform = "translateX(-120%) rotate(-10deg) scale(0.88)";
        card.style.opacity = "0";
        card.style.zIndex = "0";
        card.style.pointerEvents = "none";
      } else if (offset === 0) {
        // Active — front and center
        card.style.transform = "translateX(0) rotate(0deg) scale(1)";
        card.style.opacity = "1";
        card.style.zIndex = String(total);
        card.style.pointerEvents = "auto";
      } else if (offset <= 3) {
        // Fanned behind
        card.style.transform = `translateX(${offset * 10}px) rotate(${offset * 2.5}deg) scale(${1 - offset * 0.04})`;
        card.style.opacity = String(Math.max(0, 1 - offset * 0.18));
        card.style.zIndex = String(total - offset);
        card.style.pointerEvents = "none";
      } else {
        // Hidden
        card.style.transform = "translateX(25px) rotate(8deg) scale(0.86)";
        card.style.opacity = "0";
        card.style.zIndex = "0";
        card.style.pointerEvents = "none";
      }
    });

    if (currentEl) currentEl.textContent = current + 1;
    if (prevBtn) prevBtn.disabled = current <= 0;
    if (nextBtn) nextBtn.disabled = current >= total - 1;
  }

  function goNext() {
    if (current < total - 1) {
      current++;
      layout();
    }
  }
  function goPrev() {
    if (current > 0) {
      current--;
      layout();
    }
  }

  if (prevBtn) prevBtn.addEventListener("click", goPrev);
  if (nextBtn) nextBtn.addEventListener("click", goNext);

  // Click active card → next
  cards.forEach((card, i) => {
    card.addEventListener("click", () => {
      if (i === current) goNext();
    });
  });

  // Keyboard arrows (only when card stack is in viewport)
  document.addEventListener("keydown", (e) => {
    const stackEl = document.getElementById("cardStack");
    if (!stackEl) return;
    const rect = stackEl.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    if (e.key === "ArrowRight") goNext();
    else if (e.key === "ArrowLeft") goPrev();
  });

  // Touch swipe
  let touchStartX = 0;
  deck.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true },
  );
  deck.addEventListener(
    "touchend",
    (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? goNext() : goPrev();
      }
    },
    { passive: true },
  );

  layout();
}

/* ============================================================
   IMAGE FALLBACKS
   ============================================================ */
function initImageFallbacks() {
  const gradients = [
    "linear-gradient(135deg, #E8D5D3 0%, #D8B8B6 50%, #C9A09E 100%)",
    "linear-gradient(135deg, #D8C8C6 0%, #C9A8A6 50%, #B88489 100%)",
    "linear-gradient(135deg, #F0E0DE 0%, #D8B8B6 50%, #C09090 100%)",
    "linear-gradient(135deg, #E0D0CE 0%, #C8A8A6 50%, #B89494 100%)",
  ];

  function applyFallback(img) {
    const wrapper = img.parentElement;
    if (!wrapper || wrapper.dataset.fallback) return;
    wrapper.dataset.fallback = "true";

    if (img.closest(".hero")) {
      wrapper.style.background =
        "linear-gradient(135deg, #3D2E2F 0%, #5A4345 50%, #7A5F61 100%)";
    } else if (img.closest(".about__image-wrapper")) {
      wrapper.style.background =
        "linear-gradient(135deg, #D8B8B6 0%, #B88489 100%)";
    } else if (img.closest(".testimonial-card")) {
      const ph = document.createElement("div");
      ph.style.cssText =
        "width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#D8B8B6,#B88489);flex-shrink:0;";
      img.parentNode.insertBefore(ph, img);
    } else {
      const idx = Math.floor(Math.random() * gradients.length);
      wrapper.style.background = gradients[idx];
    }
    img.style.display = "none";
  }

  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => applyFallback(img));
    if (img.complete && img.naturalWidth === 0 && img.src) applyFallback(img);
  });
}
