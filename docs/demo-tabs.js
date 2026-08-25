(function () {
  const navButtons = document.querySelectorAll(".sc-nav-links button[data-tab]");
  const gotoButtons = document.querySelectorAll("[data-goto]");
  const sections = document.querySelectorAll(".sc-tab");

  function activate(tab) {
    navButtons.forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    sections.forEach((s) => s.classList.toggle("active", s.id === `sc-tab-${tab}`));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navButtons.forEach((btn) => btn.addEventListener("click", () => activate(btn.dataset.tab)));
  gotoButtons.forEach((btn) => btn.addEventListener("click", () => activate(btn.dataset.goto)));
})();
