import { initializeCrimeMap } from "./map.js";
const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("logout-btn");
import { login, logout } from "./auth.js";
// --- MAP LOGIC ---
// 1. Find the map element in the document
const mapElement = document.getElementById("map");

// 2. If the map element exists, get the crime data from its 'data-crimes' attribute
if (mapElement) {
  const crimes = JSON.parse(mapElement.dataset.crimes);
  // 3. Call the function from map.js to build the map
  initializeCrimeMap(crimes);
}

// --- GENERAL UI LOGIC (like the mobile menu) ---
const menuToggle = document.getElementById("menu-toggle");
const mainNav = document.getElementById("main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    mainNav.classList.toggle("hidden");
  });
}
///----auth------
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    console.log(email,password);
    
    await login(email, password);
  });
}
if (logoutBtn) {
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    await logout();
  });
}