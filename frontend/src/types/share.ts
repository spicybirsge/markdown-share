// REST response types mirror backend/types/share.ts. Creating a share
// returns a numeric timestamp; Mongo-backed reads can return it as a string.
export type ShareSource = "web" | "mcp";

interface ShareSummary {
  _id: string;
  title: string;
  description: string | null;
  createdAt: string | number;
  views: number;
  unlisted: boolean;
  source: ShareSource;
}

export interface ShareDocument extends ShareSummary {
  content: string;
}

export interface ShareListItem extends ShareSummary {
  excerpt: string | null;
}

export type ApiResponse<T> =
  | { success: true; message: string; code: number; data: T }
  | { success: false; message: string; code: number; data?: never };
