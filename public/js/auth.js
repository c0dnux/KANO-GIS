import { showAlert } from "./alert.js";

export const auth = async (type, data) => {
  const url =
    type === "login"
      ? "/api/v1/users/login"
      : type === "signup"
      ? "/api/v1/users/signup"
      : type === "updatePassword"
      ? "/api/v1/users/updatePassword"
      : "/api/v1/users/resetPassword";

  try {
    const res = await axios.post(url, data, {
      withCredentials: true,
    });
    if (res.data.status === "Success") {
      console.log();
      showAlert("success", res.data.message);
      window.setTimeout(() => {
        if (type === "login" || type === "resetPassword")
          location.assign("/map");
      }, 1500);
    }
  } catch (err) {
    console.log(err);

    showAlert("error", err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios.post("/api/v1/users/logout", {
      withCredentials: true,
    });
    if (res.data.status === "Success") {
      showAlert("success", "Goodbye!");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (err) {
    showAlert("error", "Error logging out! Try again.");
  }
};
export const forgetPassword = async (email) => {
  try {
    const res = await axios.post("/api/v1/users/forgetPassword", { email });
    if (res.data.status === "Success") {
      showAlert("success", res.data.message);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
//////--------REPORT CRIME FORM LOGIC ---------//////
export const reportCrime = async (formData) => {
  console.log(formData);

  try {
    const res = await axios.post("/api/v1/crimes/report", formData, {
      withCredentials: true,
    });
    if (res.data.status === "Success") {
      showAlert("success", res.data.message);
    }
  } catch (err) {
    console.log(err);

    showAlert("error", err.response.data.message);
  }
};
///-------UPDATE REPORT--------//////

export const updateReport = async (form, initialData) => {
  const reportId = form.dataset.id;

  const formElements = form.elements;
  const changedData = {};

  // Compare current values with the initial ones passed into the function.
  for (const element of formElements) {
    if (element.name && initialData[element.name] !== element.value) {
      changedData[element.name] = element.value;
    }
  }

  if (Object.keys(changedData).length > 0) {
    try {
      const res = await axios.patch(
        `/api/v1/crimes/crime-update/${reportId}`,
        changedData
      );
      if (res.data.status === "Success") {
        showAlert("success", res.data.message);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      showAlert("error", err.response.data.message);
    }
  } else {
    showAlert("error", "No changes made.");
  }
};

export const copyApiLink = () => {
  const apiLink = window.location.origin + "/api/v1/crimes/allCrimes";

  const btnText = document.getElementById("btn-copy-text");
  const btnIcon = document.querySelector(
    "#btn-copy-api span.material-symbols-outlined"
  );
  const originalIcon = "link";

  if (!btnText || !btnIcon) return;

  navigator.clipboard
    .writeText(apiLink)
    .then(() => {
      btnText.textContent = "Copied!";
      btnIcon.textContent = "check";
      btnIcon.classList.remove("text-gray-700", "dark:text-gray-200");
      btnIcon.classList.add("text-green-600", "dark:text-green-400");

      setTimeout(() => {
        btnText.textContent = "Copy API";
        btnIcon.textContent = originalIcon;
        btnIcon.classList.remove("text-green-600", "dark:text-green-400");
        btnIcon.classList.add("text-gray-700", "dark:text-gray-200");
      }, 2000);
    })
    .catch((err) => {
      showAlert("error", err.message);
    });
};
