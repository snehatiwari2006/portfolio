/* ===== Settings you can change ===== */
// To make the contact form really send emails, create a free form at https://formspree.io
// and paste its endpoint here, e.g. "https://formspree.io/f/abcdwxyz". Leave empty to disable sending.
const FORM_ENDPOINT = "";

/* ===== Theme toggle ===== */
const root = document.documentElement;
const themeBtn = document.getElementById("themeToggle");

function currentTheme() {
  return root.dataset.theme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}
function applyTheme(theme) {
  root.dataset.theme = theme;
  themeBtn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
  try { localStorage.setItem("theme", theme); } catch (e) {}
}
applyTheme(currentTheme());
themeBtn.addEventListener("click", () => applyTheme(currentTheme() === "dark" ? "light" : "dark"));

/* ===== Mobile navigation ===== */
const nav = document.getElementById("nav");
const menuBtn = document.getElementById("menuToggle");

function setMenu(open) {
  nav.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

/* ===== Highlight the active section in the nav ===== */
const links = [...nav.querySelectorAll("a")];
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id));
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("main section[id]").forEach(s => sectionObserver.observe(s));

/* ===== Reveal on scroll ===== */
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add("in"); obs.unobserve(entry.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

/* ===== Placeholder project links ===== */
document.querySelectorAll("a[data-placeholder]").forEach(link => {
  link.addEventListener("click", e => {
    if (link.getAttribute("href") === "#") {
      e.preventDefault();
      alert(link.dataset.placeholder + " link not added yet. Replace href=\"#\" in index.html with your real URL.");
    }
  });
});

/* ===== Contact form validation ===== */
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");
const fields = {
  name:    { el: document.getElementById("name"),    err: document.getElementById("nameErr") },
  email:   { el: document.getElementById("email"),   err: document.getElementById("emailErr") },
  message: { el: document.getElementById("message"), err: document.getElementById("msgErr") }
};

function validate() {
  let ok = true;
  const rules = {
    name:    v => v.trim().length >= 2 ? "" : "Please enter your name (at least 2 characters).",
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Please enter a valid email address.",
    message: v => v.trim().length >= 10 ? "" : "Message should be at least 10 characters."
  };
  for (const key in fields) {
    const msg = rules[key](fields[key].el.value);
    fields[key].err.textContent = msg;
    fields[key].el.classList.toggle("invalid", Boolean(msg));
    fields[key].el.setAttribute("aria-invalid", String(Boolean(msg)));
    if (msg) ok = false;
  }
  return ok;
}
Object.values(fields).forEach(f => f.el.addEventListener("input", () => { if (f.el.classList.contains("invalid")) validate(); }));

form.addEventListener("submit", async e => {
  e.preventDefault();
  statusEl.className = "status";
  if (!validate()) { statusEl.textContent = "Please fix the highlighted fields."; return; }

  if (!FORM_ENDPOINT) {
    statusEl.classList.add("warn");
    statusEl.textContent = "Validation passed, but no email service is connected yet, so nothing was sent.";
    return;
  }
  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ name: fields.name.el.value, email: fields.email.el.value, message: fields.message.el.value })
    });
    if (!res.ok) throw new Error("Request failed");
    statusEl.classList.add("ok");
    statusEl.textContent = "Thank you! Your message has been sent.";
    form.reset();
  } catch (err) {
    statusEl.classList.add("warn");
    statusEl.textContent = "Sorry, the message could not be sent. Please email me directly.";
  }
});

/* ===== Footer year ===== */
document.getElementById("year").textContent = new Date().getFullYear();