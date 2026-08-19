import { initializeCrimeMap } from "./map.js";
import {
  copyApiLink,
  auth,
  logout,
  forgetPassword,
  reportCrime,
  updateReport,
} from "./auth.js";
const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("logout-btn");
const userSignup = document.getElementById("signup-form");
const resetPasswordForm = document.getElementById("reset-password-form");
const forgotPassword = document.getElementById("forgot-password");
const forgetPasswordfunc = document.getElementById("forgot-password-func");
const reportCrimeForm = document.getElementById("report-crime");
const updateReportForm = document.getElementById("view-update-form");

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
    console.log(email, password);
    const data = { email, password };
    const btn = document.querySelector("#login-btn");
    const originalText = btn.textContent;

    try {
      // Disable button and show loading
      btn.disabled = true;
      btn.textContent = "Loading...";

      // Call API
      await auth("login", data);
    } catch (err) {
      console.error("Failed to report crime:", err);
    } finally {
      // Always revert button
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}
if (logoutBtn) {
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    await logout();
    console.log("OUTtttttt");
  });
}
if (userSignup) {
  userSignup.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      confirmPassword: document.getElementById("confirmPassword").value,
    };

    const btn = document.querySelector("#signup-btn");
    const originalText = btn.textContent;

    try {
      // Disable button and show loading
      btn.disabled = true;
      btn.textContent = "Loading...";

      // Call API
      await auth("signup", form);
    } catch (err) {
      console.error("Failed to report crime:", err);
    } finally {
      // Always revert button
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}
if (resetPasswordForm) {
  resetPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = document.getElementById("token").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const data = { password, confirmPassword, token };

    await auth("resetPassword", data);
  });
}

if (forgotPassword) {
  forgotPassword.addEventListener("click", async (e) => {
    e.preventDefault();
    window.location.href = "/forgot-password";
  });
}
if (forgetPasswordfunc) {
  forgetPasswordfunc.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    await forgetPassword(email);
  });
}
/////////-------------UPDATE PASSWORD FORM LOGIC ---------/////////
const updatePasswordForm = document.getElementById("password-update-form");
if (updatePasswordForm) {
  updatePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmNewPassword =
      document.getElementById("confirm-password").value;
    const data = {
      currentPassword,
      newPassword,
      confirmNewPassword,
    };
    console.log(data);

    await auth("updatePassword", data);
  });
}
//////--------REPORT CRIME FORM LOGIC ---------//////
if (reportCrimeForm) {
  reportCrimeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const crimeType = document.getElementById("crime-type").value;
    const description = document.getElementById("description").value;
    const date = document.getElementById("date").value;
    const address = document.getElementById("address").value;
    const city = document.getElementById("city").value;
    const localGovernment = document.getElementById("local-government").value;
    const state = document.getElementById("state").value;
    const victims = document.getElementById("victims").value;
    const data = {
      crimeType,
      description,
      date,
      victims,
      location: {
        address,
        city,
        localGovernment,
        state,
      },
    };
    const btn = document.querySelector("#report-crime-btn");
    const originalText = btn.textContent;

    try {
      // Disable button and show loading
      btn.disabled = true;
      btn.textContent = "Loading...";

      // Call API
      await reportCrime(data);
    } catch (err) {
      console.error("Failed to report crime:", err);
    } finally {
      // Always revert button
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}
///////--------UPDATE REPORT FORM LOGIC ---------//////

if (updateReportForm) {
  // --- NEW ---
  // 1. Capture the initial data *when the page loads*.
  const initialData = {};
  const formElements = updateReportForm.elements;
  for (const element of formElements) {
    if (element.name) {
      initialData[element.name] = element.value;
    }
  }
  console.log("Initial data captured on load:", initialData);
  // --- END NEW ---

  updateReportForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 2. Pass both the form AND the initial data to your function.
    updateReport(updateReportForm, initialData);
  });
}

const btnText = document.getElementById("btn-copy-text");
if (btnText) {
  btnText.addEventListener("click", copyApiLink);
}
