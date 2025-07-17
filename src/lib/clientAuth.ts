// Client-side function to refresh token before making server requests
export async function refreshTokenClientSide() {
  try {
    const res = await fetch("http://localhost:5000/auth/refresh-token", {
      method: "POST",
      credentials: "include",
    });
    console.log("Refresh response status:", res.status);
    console.log(
      "Refresh response headers:",
      Object.fromEntries(res.headers.entries())
    );

    if (res.ok) {
      const data = await res.json();
      console.log("Refresh response data:", data);
      return true; // Token refreshed successfully
    }

    const errorData = await res.json();
    console.log("Refresh error:", errorData);
    return false; // Refresh failed
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
}
