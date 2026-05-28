const accessTokenKey = "access_token";

const baseUrl = () => import.meta.env.VITE_API_BASE_URL ?? "";

const headers = (overrides: Record<string, string> = {}) => {
  const token = localStorage.getItem(accessTokenKey);
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...overrides,
  };
};

const read = async (response: Response) => {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};

export const requestGet = async (path: string) => {
  const response = await fetch(`${baseUrl()}${path}`, {
    method: "GET",
    headers: headers(),
  });
  return read(response);
};

export const requestPost = async (path: string, body: unknown) => {
  const response = await fetch(`${baseUrl()}${path}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  return read(response);
};

export interface AnalyzeResult {
  url: string;
  status: string;
  message: string;
}

export const analyzeListing = (url: string): Promise<AnalyzeResult> =>
  requestPost("/analysis", { url }) as Promise<AnalyzeResult>;

export const loginUrl = (redirectUri: string) =>
  `${baseUrl()}/auth/login?redirectUri=${encodeURIComponent(redirectUri)}`;

export const logoutUrl = (redirectUri: string) =>
  `${baseUrl()}/auth/logout?redirectUri=${encodeURIComponent(redirectUri)}`;
