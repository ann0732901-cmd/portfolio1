const root = document.documentElement;
const header = document.querySelector("[data-header]");
const hero = document.querySelector(".hero");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let scrollTicking = false;
let pointerFrame = 0;
let pointerCurrentX = 0;
let pointerCurrentY = 0;
let pointerTargetX = 0;
let pointerTargetY = 0;

function setMenu(open) {
  document.body.classList.toggle("menu-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "关闭导航菜单" : "打开导航菜单");
  mobileMenu.setAttribute("aria-hidden", String(!open));
}

function updatePageState() {
  const scrollY = window.scrollY;
  header.classList.toggle("is-scrolled", scrollY > 24);

  if (hero) {
    const progress = reduceMotion.matches
      ? 0
      : Math.min(1, Math.max(0, scrollY / Math.max(hero.offsetHeight, 1)));

    root.style.setProperty("--hero-gallery-shift", `${-68 * progress}px`);
    root.style.setProperty("--hero-gallery-scale", `${1 - 0.055 * progress}`);
  }

  scrollTicking = false;
}

function animateHeroPointer() {
  pointerCurrentX += (pointerTargetX - pointerCurrentX) * 0.09;
  pointerCurrentY += (pointerTargetY - pointerCurrentY) * 0.09;

  root.style.setProperty("--hero-pointer-x", `${pointerCurrentX.toFixed(2)}px`);
  root.style.setProperty("--hero-pointer-y", `${pointerCurrentY.toFixed(2)}px`);

  const stillMoving =
    Math.abs(pointerTargetX - pointerCurrentX) > 0.12 ||
    Math.abs(pointerTargetY - pointerCurrentY) > 0.12;

  pointerFrame = stillMoving ? window.requestAnimationFrame(animateHeroPointer) : 0;
}

function requestHeroPointerFrame() {
  if (!pointerFrame) {
    pointerFrame = window.requestAnimationFrame(animateHeroPointer);
  }
}

if (hero && !reduceMotion.matches) {
  hero.addEventListener(
    "pointermove",
    (event) => {
      const bounds = hero.getBoundingClientRect();
      pointerTargetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * -34;
      pointerTargetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * -24;
      requestHeroPointerFrame();
    },
    { passive: true },
  );

  hero.addEventListener("pointerleave", () => {
    pointerTargetX = 0;
    pointerTargetY = 0;
    requestHeroPointerFrame();
  });
}

window.addEventListener(
  "scroll",
  () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(updatePageState);
      scrollTicking = true;
    }
  },
  { passive: true },
);

menuToggle.addEventListener("click", () => {
  setMenu(!document.body.classList.contains("menu-open"));
});

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("menu-open")) {
    setMenu(false);
    menuToggle.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 800 && document.body.classList.contains("menu-open")) {
    setMenu(false);
  }
});

const revealItems = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window && !reduceMotion.matches) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.08,
    },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const faqItems = document.querySelectorAll(".faq-list details");

faqItems.forEach((item) => {
  item.querySelector("summary").addEventListener("click", () => {
    if (item.open) return;

    faqItems.forEach((otherItem) => {
      if (otherItem !== item) otherItem.open = false;
    });
  });
});

updatePageState();
