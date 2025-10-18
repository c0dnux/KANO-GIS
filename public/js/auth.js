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
