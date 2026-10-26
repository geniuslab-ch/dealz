/**
 * Phone menu: adds a ☰ button to the site header (.nav); on small screens
 * the links stay hidden until it is tapped (styles in styles.css). Tapping
 * a link closes it again.
 */
(function () {
  function init() {
    document.querySelectorAll(".nav").forEach(function (nav) {
      var links = nav.querySelector(".nav-links");
      if (!links || nav.querySelector(".nav-toggle")) return;
      var lang = document.documentElement.lang || "fr";
      var label = lang === "de" ? "Menü" : "Menu";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "nav-toggle";
      btn.setAttribute("aria-label", label);
      btn.setAttribute("aria-expanded", "false");
      btn.textContent = "☰";
      btn.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        btn.textContent = open ? "✕" : "☰";
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
      links.addEventListener("click", function (e) {
        if (e.target.closest("a") && nav.classList.contains("open")) btn.click();
      });
      nav.insertBefore(btn, links);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
