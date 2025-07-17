export async function getCurrentUser() {
  const res = await fetch("http://localhost:3000/api/me", {
    cache: "no-store",
  });

  if (!res.ok) return null;

  return res.json();
}
