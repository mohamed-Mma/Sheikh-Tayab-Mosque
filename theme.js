(function () {
  const STORAGE_KEY = "mosque-theme";

  function getPreferred() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
    return "light";
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem(STORAGE_KEY, theme);
    updateToggleLabel(theme);
  }

  function updateToggleLabel(theme) {
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.setAttribute(
        "aria-label",
        theme === "dark" ? "التبديل للوضع الفاتح" : "التبديل للوضع الداكن"
      );
      btn.title = theme === "dark" ? "وضع فاتح" : "وضع داكن";
    });
  }

  function toggleTheme() {
    const current =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";
    applyTheme(current === "dark" ? "light" : "dark");
  }

  // Apply immediately to avoid flash
  applyTheme(getPreferred());

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.addEventListener("click", toggleTheme);
    });
    updateToggleLabel(getPreferred());
  });
})();
