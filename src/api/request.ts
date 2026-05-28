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

export type AnalysisStepStatus = "running" | "success" | "error";

export interface AnalysisStep {
  type: "step";
  id: string;
  status: AnalysisStepStatus;
  label: string;
}

export interface AnalysisResultData {
  url?: string;
  price?: string | null;
  area?: string | null;
  rooms?: string | null;
  summary?: string;
  [key: string]: unknown;
}

export interface AnalysisResultMessage {
  type: "result";
  data: AnalysisResultData;
}

export type AnalysisMessage = AnalysisStep | AnalysisResultMessage;

// Streams analysis progress as newline-delimited JSON. The server flushes one
// message per line as it works, and onMessage fires for each as it arrives.
export const analyzeListingStream = async (
  url: string,
  onMessage: (message: AnalysisMessage) => void,
  signal?: AbortSignal
): Promise<void> => {
  const response = await fetch(`${baseUrl()}/analysis`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ url }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`Analysis request failed (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const flushLines = (final: boolean) => {
    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (line.length > 0) {
        onMessage(JSON.parse(line) as AnalysisMessage);
      }
    }
    if (final) {
      const tail = buffer.trim();
      if (tail.length > 0) {
        onMessage(JSON.parse(tail) as AnalysisMessage);
      }
    }
  };

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    flushLines(false);
  }

  buffer += decoder.decode();
  flushLines(true);
};

export const loginUrl = (redirectUri: string) =>
  `${baseUrl()}/auth/login?redirectUri=${encodeURIComponent(redirectUri)}`;

export const logoutUrl = (redirectUri: string) =>
  `${baseUrl()}/auth/logout?redirectUri=${encodeURIComponent(redirectUri)}`;
