/* Menu mobile (drawer): abre/fecha, trava o scroll e fecha ao navegar ou apertar Esc. */

function initMobileDrawer() {
  const toggle = document.getElementById("menu-toggle");
  const drawer = document.getElementById("mobile-drawer");
  if (!toggle || !drawer) return;

  const iconOpen = toggle.querySelector(".icon-open");
  const iconClose = toggle.querySelector(".icon-close");

  function openDrawer() {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    iconOpen.style.display = "none";
    iconClose.style.display = "block";
    document.body.classList.add("drawer-open");
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    iconOpen.style.display = "block";
    iconClose.style.display = "none";
    document.body.classList.remove("drawer-open");
  }

  toggle.addEventListener("click", () => {
    drawer.classList.contains("is-open") ? closeDrawer() : openDrawer();
  });

  drawer.querySelectorAll("[data-drawer-close], a").forEach((el) => {
    el.addEventListener("click", closeDrawer);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });
}

initMobileDrawer();
