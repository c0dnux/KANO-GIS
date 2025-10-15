import { showAlert } from "./alert.js";

export const login = async (email, password) => {
  try {
    const res = await axios.post(
      "/api/v1/users/login",
      {
        email,
        password,
      },
      { withCredentials: true }
    );
    console.log(res);
    
    if (res.data.status === "Success") {
      showAlert("success", "Logged in successfully");
      window.setTimeout(() => {
        location.assign("/HOME");
      }, 1500);
    }
  } catch (err) {
    
    showAlert("error", err.response.data.message);
  }
};
export const logout = async () => {
  try {
    const res = await axios.get("/api/v1/users/logout", { withCredentials: true });
    if (res.data.status === "Success") location.reload(true);
  } catch (err) {
    showAlert("error", "Error logging out! Try again.");
  }
};
