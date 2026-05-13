export const API_BASE_URL = "http://127.0.0.1:3000";

async function parseError(response: Response) {
  const text = await response.text();
  if (!text) return "Eroare server";

  try {
    const body = JSON.parse(text);
    if (Array.isArray(body.message)) return body.message.join("; ");
    return body.message || text;
  } catch {
    return text;
  }
}

export async function apiFetch(path: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response;
}

export async function apiJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await apiFetch(path, options);
  if (response.status === 204) return null as T;
  return response.json() as Promise<T>;
}
