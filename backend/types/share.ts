export type ShareSource = 'web' | 'mcp';

// HTTP inputs remain unknown until the service validates them.
export interface CreateShareInput {
    content?: unknown;
    title?: unknown;
    description?: unknown;
    isUnlisted?: unknown;
    source?: unknown;
    clientName?: unknown;
    idempotencyKey?: unknown;
}

export interface ShareSummary {
    _id: string;
    title: string;
    description: string | null;
    // Creates use Date.now(); the existing Mongo schema stores it as a string.
    createdAt: string | number;
    views: number;
    unlisted: boolean;
    source: ShareSource;
}

export interface Share extends ShareSummary {
    content: string;
}

export interface ShareListItem extends ShareSummary {
    excerpt: string | null;
}

export interface CreateShareResult {
    share: Share;
    replayed: boolean;
}

export interface GetShareOptions {
    countView?: boolean;
    ip?: string;
}

export interface ListSharesOptions {
    limit?: unknown;
}
