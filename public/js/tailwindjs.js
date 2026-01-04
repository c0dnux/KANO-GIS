tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#1173d4",
        "background-light": "#f6f7f8",
        "background-dark": "#101922",

        // 👇 Add these:
        "foreground-light": "#0f172a", // slate-900
        "foreground-dark": "#f8fafc",  // slate-50
        "card-light": "#ffffff",
        "card-dark": "#1e293b", // slate-800
        "border-light": "#e5e7eb", // gray-200
        "border-dark": "#374151", // gray-700
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      fontFamily: {
        display: ["Public Sans"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        full: "9999px",
      },
    },
  },
};

// Automatically set dark mode if system prefers it
// Get the media query for dark mode
const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

// Initial check
if (darkModeMediaQuery.matches) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

// Listen for changes in system theme
darkModeMediaQuery.addEventListener("change", (e) => {
  if (e.matches) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
});

