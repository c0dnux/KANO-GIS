import { showAlert } from "./alert.js";

export const auth = async (type, data) => {
  const url =
    type === "login"
      ? "/api/v1/users/login"
      : type === "signup"
      ? "/api/v1/users/signup"
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
    if (res.data.status === "Success") location.reload(true);
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
    console.log("Hola backend ", changedData);

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
