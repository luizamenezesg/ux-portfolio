(() => {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark" || (!savedTheme && matchMedia("(prefers-color-scheme: dark)").matches)) root.classList.add("dark");

  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const themeToggle = document.querySelector(".theme-toggle");
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  const syncThemeIcon = () => {
    if (!themeToggle) return;
    themeToggle.innerHTML = root.classList.contains("dark") ? '<span class="icon icon-sun" aria-hidden="true"></span>' : '<span class="icon icon-moon" aria-hidden="true"></span>';
  };
  syncThemeIcon();

  addEventListener("scroll", () => header?.classList.toggle("scrolled", scrollY > 40), { passive: true });
  navToggle?.addEventListener("click", () => {
    const open = navMenu?.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(Boolean(open)));
    navToggle.innerHTML = open ? '<span class="icon icon-x" aria-hidden="true"></span>' : '<span class="icon icon-menu" aria-hidden="true"></span>';
  });
  navMenu?.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      navMenu.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
      if (navToggle) navToggle.innerHTML = '<span class="icon icon-menu" aria-hidden="true"></span>';
    }
  });
  themeToggle?.addEventListener("click", () => {
    root.classList.toggle("dark");
    localStorage.setItem("theme", root.classList.contains("dark") ? "dark" : "light");
    syncThemeIcon();
  });

  document.querySelectorAll("[data-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      const modal = document.getElementById(button.dataset.modal);
      modal?.classList.add("open");
      modal?.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
  });
  document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", closeModals));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModals();
      closeLightbox();
    }
  });
  function closeModals() {
    document.querySelectorAll(".modal.open").forEach((modal) => {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    });
    document.body.style.overflow = "";
  }

  const lightbox = document.querySelector(".lightbox");
  const lightboxImg = lightbox?.querySelector("img");
  document.querySelectorAll("[data-lightbox]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!lightbox || !lightboxImg) return;
      lightboxImg.src = button.dataset.lightbox;
      lightboxImg.alt = button.dataset.alt || "";
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
  });
  lightbox?.addEventListener("click", closeLightbox);
  lightboxImg?.addEventListener("click", (event) => event.stopPropagation());
  function closeLightbox() {
    if (!lightbox || !lightboxImg) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.removeAttribute("src");
    document.body.style.overflow = "";
  }

  const canvas = document.getElementById("particles");
  if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = canvas.getContext("2d");
  let particles = [];
  let mouse = { x: -9999, y: -9999 };
  let visible = true;
  const settings = { connection: 120, mouse: 150 };

  function colors() {
    return root.classList.contains("dark")
      ? { particle: "180,170,240", hover: "240,100,180" }
      : { particle: "58,48,118", hover: "151,38,110" };
  }
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = innerWidth < 768 ? 30 : 80;
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: (Math.random() - .5) * .3,
      vy: (Math.random() - .5) * .3,
      r: Math.random() * 1.5 + 1
    }));
  }
  addEventListener("resize", resize, { passive: true });
  addEventListener("mousemove", (event) => { if (innerWidth >= 768) mouse = { x: event.clientX, y: event.clientY }; }, { passive: true });
  addEventListener("mouseleave", () => { mouse = { x: -9999, y: -9999 }; });
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; });
  resize();
  function draw() {
    requestAnimationFrame(draw);
    if (!visible) return;
    const c = colors();
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
      const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      const near = dm < settings.mouse;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = near ? `rgba(${c.hover},.6)` : `rgba(${c.particle},.35)`;
      ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const d = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (d < settings.connection) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(${c.particle},${(1 - d / settings.connection) * .12})`;
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
      if (near && innerWidth >= 768) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(${c.hover},${(1 - dm / settings.mouse) * .2})`;
        ctx.lineWidth = .6;
        ctx.stroke();
      }
    });
  }
  draw();
})();