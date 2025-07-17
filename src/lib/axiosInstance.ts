// lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // your NestJS backend URL
  withCredentials: true, // include cookies in every request
});

api.interceptors.request.use(
  (config) => {
    console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`);
    // Log withCredentials flag
    console.log("withCredentials:", config.withCredentials);
    // Log all request headers
    console.log("Request headers:", config.headers);
    // Log cookies accessible to JS (not HTTP-only cookies)
    console.log(
      "document.cookie:",
      typeof document !== "undefined" ? document.cookie : "Not in browser"
    );
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    const originalRequest = error.config;

    if (
      status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh-token"
    ) {
      originalRequest._retry = true;

      console.warn(
        "[401] Unauthorized – maybe redirect to login or clear state"
      );

      try {
        await api.post("/auth/refresh-token");
        if (
          originalRequest.data &&
          typeof originalRequest.data === "object" &&
          !(originalRequest.data instanceof FormData)
        ) {
          originalRequest.data = JSON.stringify(originalRequest.data);
          originalRequest.headers["Content-Type"] = "application/json";
        }
        return api(originalRequest);
      } catch (refreshErr) {
        console.warn("Refresh token expired. Redirecting to login", refreshErr);
      }
    }

    if (status === 403) {
      console.warn("[403] Forbidden – user not allowed");
    }

    return Promise.reject(error); // Let individual calls also handle errors
  }
);

export default api;
