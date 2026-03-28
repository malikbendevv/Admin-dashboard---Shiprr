// Client-side function to refresh token before making server requests
export async function refreshTokenClientSide() {
  try {
    const res = await fetch("http://localhost:5000/auth/refresh-token", {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) {
      await res.json();
      return true;
    }

    await res.json();
    return false;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
}
