import { Router } from 'express';
import { getShare, listShares } from '../../services/shares';
import asyncHandler from '../../middleware/asyncHandler';
import type { Share, ShareListItem } from '../../types/share';

const router = Router();

// `metafetch` lets the frontend read a share for page metadata without
// inflating the view count.
function isTruthy(value: unknown): boolean {
    return value === true || value === 'true' || value === '1';
}

router.get('/share', asyncHandler<Share>(async (req, res) => {
    const { id, metafetch } = req.query;

    const share = await getShare(id, {
        countView: !isTruthy(metafetch),
        ip: req.ip
    });

    return res.status(200).json({ success: true, message: "share found", data: share, code: 200 });
}));

router.get('/latest-shares', asyncHandler<ShareListItem[]>(async (req, res) => {
    const { limit } = req.query;

    const latestShares = await listShares({ limit });

    return res.status(200).json({ success: true, message: `latest ${latestShares.length} shares`, data: latestShares, code: 200 });
}));

export default router;
