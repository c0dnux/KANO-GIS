// Variable to hold the timer ID
let hideAlertTimer;

// Function to hide the alert with a fade-out animation
export const hideAlert = () => {
  const el = document.querySelector(".alert");
  if (el) {
    // 1. Add classes to trigger the hide animation
    el.classList.add("opacity-0", "-translate-y-10");

    // 2. Remove the element from the DOM after the animation completes
    setTimeout(() => {
      // Check if the element and its parent still exist before trying to remove it
      if (el.parentElement) {
        el.parentElement.removeChild(el);
      }
    }, 500); // Must match the transition duration
  }
};

// Function to show the alert
export const showAlert = (type, msg) => {
  hideAlert(); // Hide any existing alerts first

  // A. Clear any previously scheduled automatic hide timers
  clearTimeout(hideAlertTimer);

  // Define styles and icons... (rest of your code is the same)
  const successStyles =
    "bg-green-100 border-green-400 text-green-700 dark:bg-green-800/50 dark:text-green-200 dark:border-green-600";
  const errorStyles =
    "bg-red-100 border-red-400 text-red-700 dark:bg-red-800/50 dark:text-red-200 dark:border-red-600";
  const successIcon = `<span class="material-symbols-outlined">check_circle</span>`;
  const errorIcon = `<span class="material-symbols-outlined">error</span>`;
  const isSuccess = type === "success";

  const markup = `
    <div class="alert fixed top-5 left-1/2 -translate-x-1/2 flex items-center gap-4 w-auto max-w-sm p-4 rounded-lg border shadow-lg z-50 transition-all duration-500 ease-in-out ${
      isSuccess ? successStyles : errorStyles
    }">
      ${isSuccess ? successIcon : errorIcon}
      <p class="font-medium">${msg}</p>
    </div>
  `;

  document.body.insertAdjacentHTML("afterbegin", markup);

  // B. Store the new timer's ID
  hideAlertTimer = setTimeout(hideAlert, 5000);
};
