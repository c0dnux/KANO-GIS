

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const menuButton = document.getElementById("menu-button");
  const closeButton = document.getElementById("close-button");
  const overlay = document.getElementById("sidebar-overlay");

  function openSidebar() {
    sidebar.classList.remove("-translate-x-full");
    overlay.classList.remove("hidden");
  }

  function closeSidebar() {
    sidebar.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
  }

  menuButton.addEventListener("click", openSidebar);
  closeButton.addEventListener("click", closeSidebar);
  overlay.addEventListener("click", closeSidebar);
});
