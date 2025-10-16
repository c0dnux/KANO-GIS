import { showAlert } from "./alert.js";

export const auth = async (type, data) => {
  const url = type === "login" ? "/api/v1/users/login" : "/api/v1/users/signup";

  try {
    const res = await axios.post(url, data, {
      withCredentials: true,
    });
    if (res.data.status === "Success") {
      console.log();
      showAlert("success", res.data.message);
      window.setTimeout(() => {
        if (type === "login") location.assign("/map");
      }, 1500);
    }
  } catch (err) {
    console.log(err);

    showAlert("error", err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios.get("/api/v1/users/logout", {
      withCredentials: true,
    });
    if (res.data.status === "Success") location.reload(true);
  } catch (err) {
    showAlert("error", "Error logging out! Try again.");
  }
};
