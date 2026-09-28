(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Current year
  const year = $("#currentYear");
  if (year) year.textContent = new Date().getFullYear();

  // Mobile navigation
  const navToggle = $("#navToggle");
  const navMenu = $("#navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      navToggle.classList.toggle("active", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("menu-open", isOpen);
    });

    $$(".nav-link", navMenu).forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        navToggle.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
      });
    });
  }

  // Persistent navbar + floating back-to-top button
  const header = $("#siteHeader");
  const floatingTop = $("#floatingTop");

  function updateScrollUI() {
    const current = window.scrollY;

    if (header) {
      header.classList.remove("is-hidden");
      header.classList.toggle("scrolled", current > 24);
    }

    if (floatingTop) {
      floatingTop.classList.toggle("show", current > 420);
    }
  }

  updateScrollUI();
  window.addEventListener("scroll", updateScrollUI, { passive: true });

  // Reveal animation
  const revealItems = $$(".reveal");

  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealItems.forEach(el => revealObserver.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add("in-view"));
  }

  // Active nav by section
  const sections = $$("main section[id]");
  const navLinks = $$(".nav-link");

  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        navLinks.forEach(link => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${entry.target.id}`
          );
        });
      });
    }, {
      rootMargin: "-40% 0px -50% 0px",
      threshold: 0
    });

    sections.forEach(section => navObserver.observe(section));
  }

  /* ===================================
   PROJECT FILTER + PAGINATION
=================================== */

const projectCards = [
  ...document.querySelectorAll(".project-card")
];

const filterButtons = [
  ...document.querySelectorAll(".filter-btn")
];

const pagination = document.getElementById("projectPagination");

const projectsPerPage = 9;

let activeFilter = "all";
let currentPage = 1;


/* Ambil project berdasarkan filter */

function getFilteredProjects() {
  return projectCards.filter((card) => {

    if (activeFilter === "all") {
      return true;
    }

    return card.dataset.category === activeFilter;

  });
}


/* Render card */

function renderProjects() {

  const filteredProjects = getFilteredProjects();

  const startIndex =
    (currentPage - 1) * projectsPerPage;

  const endIndex =
    startIndex + projectsPerPage;


  /* hide semua terlebih dahulu */

  projectCards.forEach((card) => {
    card.classList.add("is-hidden");
  });


  /* tampilkan hanya project halaman aktif */

  filteredProjects
    .slice(startIndex, endIndex)
    .forEach((card) => {
      card.classList.remove("is-hidden");
    });


  renderPagination(filteredProjects.length);
}


/* Pagination */

function renderPagination(totalProjects) {

  if (!pagination) return;

  pagination.innerHTML = "";

  const totalPages =
    Math.ceil(totalProjects / projectsPerPage);


  /* tidak perlu pagination jika cuma 1 halaman */

  if (totalPages <= 1) {
    pagination.style.display = "none";
    return;
  }

  pagination.style.display = "flex";


  /* Previous */

  const prevButton =
    document.createElement("button");

  prevButton.className = "page-btn";
  prevButton.innerHTML =
    '<i class="bi bi-chevron-left"></i>';

  prevButton.disabled =
    currentPage === 1;

  prevButton.setAttribute(
    "aria-label",
    "Halaman sebelumnya"
  );

  prevButton.addEventListener("click", () => {

    if (currentPage > 1) {
      currentPage--;

      renderProjects();
      scrollToProject();
    }

  });

  pagination.appendChild(prevButton);


  /* Nomor halaman */

  for (let page = 1; page <= totalPages; page++) {

    const pageButton =
      document.createElement("button");

    pageButton.className = "page-btn";

    pageButton.textContent = page;


    if (page === currentPage) {
      pageButton.classList.add("active");
    }


    pageButton.addEventListener("click", () => {

      currentPage = page;

      renderProjects();
      scrollToProject();

    });

    pagination.appendChild(pageButton);

  }


  /* Next */

  const nextButton =
    document.createElement("button");

  nextButton.className = "page-btn";
  nextButton.innerHTML =
    '<i class="bi bi-chevron-right"></i>';

  nextButton.disabled =
    currentPage === totalPages;

  nextButton.setAttribute(
    "aria-label",
    "Halaman berikutnya"
  );

  nextButton.addEventListener("click", () => {

    if (currentPage < totalPages) {
      currentPage++;

      renderProjects();
      scrollToProject();
    }

  });

  pagination.appendChild(nextButton);
}


/* Filter */

filterButtons.forEach((button) => {

  button.addEventListener("click", () => {

    filterButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    activeFilter =
      button.dataset.filter;

    /* selalu kembali ke page 1 */
    currentPage = 1;

    renderProjects();

  });

});


/* Smooth scroll ketika pindah page */

function scrollToProject() {

  const portfolio =
    document.getElementById("portfolio");

  if (!portfolio) return;

  const navbarOffset = 115;

  const position =
    portfolio.getBoundingClientRect().top +
    window.pageYOffset -
    navbarOffset;

  window.scrollTo({
    top: position,
    behavior: "smooth"
  });

}


/* Initial render */

renderProjects();

  // Interactive hero ID card: desktop pointer drag with safe bounds.
  const idStage = $("#idStage");
  const idCard = $("#draggableIdCard");
  const idDrop = $("#idCardDrop");
  const finePointer = window.matchMedia("(pointer: fine)");

  if (idStage && idCard) {
    const dragState = {
      active: false,
      pointerId: null,
      startX: 0,
      startY: 0,
      baseX: 0,
      baseY: 0,
      x: 0,
      y: 0,
      lastClientX: 0,
      rotation: -2
    };

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    function getBounds() {
      const stage = idStage.getBoundingClientRect();
      const cardWidth = idCard.offsetWidth;
      const cardHeight = idCard.offsetHeight;

      // A little extra horizontal freedom keeps dragging fun without letting
      // the card escape the hero area or cover the text column excessively.
      const maxX = Math.max(36, (stage.width - cardWidth) / 2 + 42);
      const maxY = Math.max(28, (stage.height - cardHeight) / 2 + 26);
      return { maxX, maxY };
    }

    function renderCard(instant = false) {
      if (instant) idCard.style.transition = "none";
      idCard.style.setProperty("--drag-x", `${dragState.x}px`);
      idCard.style.setProperty("--drag-y", `${dragState.y}px`);
      idCard.style.setProperty("--drag-r", `${dragState.rotation}deg`);
      if (instant) {
        requestAnimationFrame(() => { idCard.style.transition = ""; });
      }
    }

    function resetCard() {
      dragState.x = 0;
      dragState.y = 0;
      dragState.rotation = -2;
      renderCard();
    }

    function keepCardInBounds() {
      const { maxX, maxY } = getBounds();
      dragState.x = clamp(dragState.x, -maxX, maxX);
      dragState.y = clamp(dragState.y, -maxY, maxY);
      renderCard(true);
    }

    function canDrag() {
      return finePointer.matches && !prefersReducedMotion;
    }

    idCard.addEventListener("pointerdown", event => {
      if (!canDrag() || event.button !== 0) return;

      dragState.active = true;
      dragState.pointerId = event.pointerId;
      dragState.startX = event.clientX;
      dragState.startY = event.clientY;
      dragState.baseX = dragState.x;
      dragState.baseY = dragState.y;
      dragState.lastClientX = event.clientX;

      idCard.classList.add("is-dragging");
      idCard.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    idCard.addEventListener("pointermove", event => {
      if (!dragState.active || event.pointerId !== dragState.pointerId) return;

      const { maxX, maxY } = getBounds();
      const dx = event.clientX - dragState.startX;
      const dy = event.clientY - dragState.startY;
      const velocityX = event.clientX - dragState.lastClientX;

      dragState.x = clamp(dragState.baseX + dx, -maxX, maxX);
      dragState.y = clamp(dragState.baseY + dy, -maxY, maxY);
      dragState.rotation = clamp(velocityX * 0.62 + dx * 0.012, -8, 8);
      dragState.lastClientX = event.clientX;
      renderCard(true);
    });

    function endDrag(event) {
      if (!dragState.active) return;
      if (event && dragState.pointerId !== null && event.pointerId !== dragState.pointerId) return;

      dragState.active = false;
      idCard.classList.remove("is-dragging");
      dragState.rotation = clamp(dragState.x * 0.015 - 1.2, -4, 4);
      renderCard();

      if (event && idCard.hasPointerCapture?.(event.pointerId)) {
        idCard.releasePointerCapture(event.pointerId);
      }
      dragState.pointerId = null;
    }

    idCard.addEventListener("pointerup", endDrag);
    idCard.addEventListener("pointercancel", endDrag);
    idCard.addEventListener("lostpointercapture", () => {
      if (dragState.active) endDrag();
    });

    idCard.addEventListener("dblclick", () => {
      if (finePointer.matches) resetCard();
    });

    window.addEventListener("resize", keepCardInBounds, { passive: true });
    finePointer.addEventListener?.("change", () => {
      if (!finePointer.matches) resetCard();
    });

    // Once the entrance animation has completed, add a subtle settled state.
    idDrop?.addEventListener("animationend", () => {
      idStage.classList.add("id-card-landed");
    }, { once: true });
  }

  // Hero cursor glow
  const hero = $("#hero");

  if (hero && !prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    hero.addEventListener("pointermove", event => {
      const rect = hero.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      hero.style.setProperty("--mx", `${x}%`);
      hero.style.setProperty("--my", `${y}%`);
    });
  }

  // -------------------------------------------------------------
  // CURSOR SMOKE
  // Lightweight canvas particles:
  // - creates diffuse smoke around cursor
  // - uses additive blending + radial gradients
  // - capped particle count for performance
  // - pauses when tab is hidden
  // -------------------------------------------------------------
  const canvas = $("#smokeCanvas");

  if (hero && canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext("2d", { alpha: true });
    const particles = [];
    const MAX_PARTICLES = 95;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let rafId = null;
    let isVisible = true;
    let lastPointer = { x: 0, y: 0 };
    let previousPointer = { x: 0, y: 0 };
    let pointerInside = false;
    let ambientTimer = 0;

    function resizeCanvas() {
      const rect = hero.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    class SmokeParticle {
      constructor(x, y, energy = 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.18 + Math.random() * 0.55 * energy;

        this.x = x + (Math.random() - 0.5) * 18;
        this.y = y + (Math.random() - 0.5) * 18;
        this.vx = Math.cos(angle) * speed + (Math.random() - 0.5) * 0.12;
        this.vy = Math.sin(angle) * speed - (0.12 + Math.random() * 0.28);
        this.radius = 16 + Math.random() * 24;
        this.life = 0;
        this.maxLife = 65 + Math.random() * 55;
        this.expand = 0.28 + Math.random() * 0.55;

        const palette = [
          [223, 106, 39],  // logo orange
          [180, 73, 11],   // burnt orange
          [242, 160, 110]  // warm highlight
        ];
        this.color = palette[Math.floor(Math.random() * palette.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.992;
        this.vy -= 0.002;
        this.radius += this.expand;
        this.life += 1;
      }

      draw() {
        const progress = this.life / this.maxLife;
        const fadeIn = Math.min(progress * 5, 1);
        const fadeOut = 1 - progress;
        const alpha = Math.max(0, fadeIn * fadeOut * 0.13);

        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.radius
        );

        const [r, g, b] = this.color;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
        gradient.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${alpha * 0.55})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      get dead() {
        return this.life >= this.maxLife;
      }
    }

    function addSmoke(x, y, amount = 2, energy = 1) {
      for (let i = 0; i < amount; i++) {
        particles.push(new SmokeParticle(x, y, energy));
      }

      if (particles.length > MAX_PARTICLES) {
        particles.splice(0, particles.length - MAX_PARTICLES);
      }
    }

    function onPointerMove(event) {
      const rect = hero.getBoundingClientRect();

      previousPointer.x = lastPointer.x;
      previousPointer.y = lastPointer.y;

      lastPointer.x = event.clientX - rect.left;
      lastPointer.y = event.clientY - rect.top;

      const dx = lastPointer.x - previousPointer.x;
      const dy = lastPointer.y - previousPointer.y;
      const velocity = Math.min(Math.hypot(dx, dy) / 18, 2.1);
      const amount = velocity > 1.1 ? 4 : 2;

      addSmoke(lastPointer.x, lastPointer.y, amount, 0.8 + velocity);
    }

    function addAmbientSmoke() {
      ambientTimer += 1;
      if (ambientTimer < 18) return;
      ambientTimer = 0;

      const x = width * (0.18 + Math.random() * 0.64);
      const y = height * (0.42 + Math.random() * 0.38);
      addSmoke(x, y, 1, 0.45);
    }

    function animate() {
      if (!isVisible) return;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "screen";

      addAmbientSmoke();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();

        if (p.dead) particles.splice(i, 1);
      }

      ctx.globalCompositeOperation = "source-over";
      rafId = requestAnimationFrame(animate);
    }

    hero.addEventListener("pointerenter", event => {
      pointerInside = true;
      const rect = hero.getBoundingClientRect();
      lastPointer.x = event.clientX - rect.left;
      lastPointer.y = event.clientY - rect.top;
      previousPointer.x = lastPointer.x;
      previousPointer.y = lastPointer.y;
    });

    hero.addEventListener("pointerleave", () => {
      pointerInside = false;
    });

    hero.addEventListener("pointermove", onPointerMove, { passive: true });

    window.addEventListener("resize", resizeCanvas, { passive: true });

    document.addEventListener("visibilitychange", () => {
      isVisible = !document.hidden;

      if (isVisible && !rafId) {
        animate();
      }

      if (!isVisible && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });

    resizeCanvas();
    animate();
  }
})();
