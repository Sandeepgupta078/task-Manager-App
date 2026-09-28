import axios from "axios";

const api = axios.create({
  // baseURL: import.meta.env.VITE_API_URL,
  baseURL: "https://task-manager-app-1-jyz5.onrender.com/api",
  withCredentials: true, // send the httpOnly auth cookie
  timeout: 20000,
});

// pull a readable message out of any axios error
export const getErrorMessage = (err) => {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.code === "ECONNABORTED") return "Request timed out, please try again";
  if (!err.response) return "Cannot reach the server. Is the backend running?";
  return "Something went wrong";
};

export default api;
