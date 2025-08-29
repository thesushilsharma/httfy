export async function apiCall({
  url,
  method,
  body,
}: {
  url: string;
  method: "POST" | "DELETE";
  body: object;
}) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "API call failed");
  }
  return response.json();
}