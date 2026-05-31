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

export type ProgressStepStatus = "running" | "success" | "error";

export interface ProgressStepItem {
  label: string;
  detail?: string;
  url?: string;
}

// One progress step in a streamed run. Steps are keyed by id and may transition
// (running → success/error) in place; items is the optional nested sublist (e.g.
// the harvested documents under the "documents" step).
export interface ProgressStep {
  type: "step";
  id: string;
  status: ProgressStepStatus;
  label: string;
  items?: ProgressStepItem[];
}

export type DocumentType =
  | "Other"
  | "Arsredovisning"
  | "Energideklaration"
  | "Stadgar";

export interface ListingDocument {
  type: DocumentType;
  title: string;
  url: string;
}

// The collected listing — mirrors the API's PropertyListing. Scrape-derived facts
// are best-effort, so most are nullable; documents are the harvested BRF documents.
export interface PropertyListing {
  id: string;
  url: string;
  listingId?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  municipality?: string | null;
  propertyType: string;
  rooms?: number | null;
  livingAreaSqm?: number | null;
  floor?: string | null;
  buildYear?: number | null;
  askingPriceSek?: number | null;
  monthlyFeeSek?: number | null;
  balcony?: boolean | null;
  elevator?: boolean | null;
  brfName?: string | null;
  brfOrgNumber?: string | null;
  brokerCompany?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  documents: ListingDocument[];
}

export type OrderStatus = "InProgress" | "Failed" | "Completed";

// The terminal payload of a collecting order: the order id, its final status, and
// the collected property.
export interface OrderResultData {
  orderId: string;
  status: OrderStatus;
  property: PropertyListing;
}

export interface OrderResultMessage {
  type: "result";
  data: OrderResultData;
}

export type ProgressMessage = ProgressStep | OrderResultMessage;

// Starts a collecting order for a listing and streams its progress as
// newline-delimited JSON. The server flushes one message per line as it works,
// and onMessage fires for each as it arrives; the final "result" message carries
// the collected property.
export const collectListingStream = async (
  url: string,
  onMessage: (message: ProgressMessage) => void,
  signal?: AbortSignal
): Promise<void> => {
  const response = await fetch(`${baseUrl()}/orders`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ url }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`Order request failed (${response.status})`);
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
        onMessage(JSON.parse(line) as ProgressMessage);
      }
    }
    if (final) {
      const tail = buffer.trim();
      if (tail.length > 0) {
        onMessage(JSON.parse(tail) as ProgressMessage);
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
