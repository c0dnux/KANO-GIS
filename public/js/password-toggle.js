document.addEventListener("DOMContentLoaded", function () {
  // Helper function to set up a password toggle
  function setupPasswordToggle(buttonId, inputId, openIconId, closedIconId) {
    const toggleBtn = document.getElementById(buttonId);
    const passwordInput = document.getElementById(inputId);
    const openIcon = document.getElementById(openIconId);
    const closedIcon = document.getElementById(closedIconId);

    // Check if all elements exist before adding listener
    if (toggleBtn && passwordInput && openIcon && closedIcon) {
      toggleBtn.addEventListener("click", function () {
        // Check the current type of the input
        const isPassword = passwordInput.type === "password";

        // Change the input type
        passwordInput.type = isPassword ? "text" : "password";

        // Toggle the visibility of the icons
        openIcon.classList.toggle("hidden", isPassword);
        closedIcon.classList.toggle("hidden", !isPassword);
      });
    }
  }

  // Set up the first password field
  setupPasswordToggle(
    "toggle-password-btn",
    "password",
    "eye-open-icon",
    "eye-closed-icon"
  );

  // Set up the second password (confirm) field
  setupPasswordToggle(
    "toggle-confirm-password-btn",
    "confirmPassword",
    "confirm-eye-open-icon",
    "confirm-eye-closed-icon"
  );
});
