import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // backend will come later
  timeout: 10000,
});

export default api;
