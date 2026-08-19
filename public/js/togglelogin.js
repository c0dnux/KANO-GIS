document.addEventListener("DOMContentLoaded", function () {
  const toggleButtons = document.querySelectorAll(".password-toggle-btn");

  toggleButtons.forEach((button) => {
    const inputId = button.dataset.inputId;
    if (!inputId) return;

    const passwordInput = document.getElementById(inputId);
    const openIcon = button.querySelector(".eye-open-icon");
    const closedIcon = button.querySelector(".eye-closed-icon");

    if (passwordInput && openIcon && closedIcon) {
      button.addEventListener("click", function () {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";

        // Toggle the icons
        openIcon.classList.toggle("hidden", isPassword);
        closedIcon.classList.toggle("hidden", !isPassword);

        // 🔹 Make the eye icon blue when visible
        if (!isPassword) {
          openIcon.classList.add("text-primary");
        } else {
          openIcon.classList.remove("text-primary");
        }
      });
    }
  });
});
