(function () {
  const navButtons = document.querySelectorAll(".nav-links button[data-tab]");
  const gotoButtons = document.querySelectorAll("[data-goto]");
  const sections = document.querySelectorAll(".tab-section");

  function activate(tab) {
    navButtons.forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    sections.forEach((s) => s.classList.toggle("active", s.id === `tab-${tab}`));
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.dispatchEvent(new CustomEvent("dealz:tab", { detail: { tab } }));
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => activate(btn.dataset.tab));
  });
  gotoButtons.forEach((btn) => {
    btn.addEventListener("click", () => activate(btn.dataset.goto));
  });
})();
