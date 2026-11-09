import mongoose from 'mongoose';
import type { ShareSource } from '../../types/share';

// Keep the existing storage types: createdAt is a string and _id is a UUID.
export interface ShareRecord {
    _id: string;
    title: string;
    description: string | null;
    content: string;
    createdAt: string;
    views: string[];
    unlisted: boolean;
    source?: ShareSource;
    clientName?: string;
    idempotencyKey?: string;
}

const shares = new mongoose.Schema<ShareRecord>({
    _id: String,
    title: String,
    description: String,
    content: String,
    createdAt: String,
    views: [String],
    unlisted: Boolean,
    // where the share was created: "web" for the editor, "mcp" for agent clients
    source: { type: String, default: "web" },
    // optional label for the client that created an mcp share
    clientName: String,
    // replay guard for clients that retry a create after a timeout
    idempotencyKey: String
})

// Sparse so the shares without a key (every share created so far, and every
// share created from the web editor) do not collide on a missing value.
shares.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

export default mongoose.model<ShareRecord>('Shares', shares);
