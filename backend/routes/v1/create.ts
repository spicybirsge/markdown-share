import { Router } from 'express';
import { createShare } from '../../services/shares';
import asyncHandler from '../../middleware/asyncHandler';
import type { CreateShareInput, Share } from '../../types/share';

const router = Router();

router.post('/share', asyncHandler<Share, CreateShareInput>(async (req, res) => {
    const body = req.body || {};

    const { share } = await createShare({
        content: body.content,
        title: body.title,
        description: body.description,
        isUnlisted: body.isUnlisted,
        // lets a client retry a create safely after a timeout
        idempotencyKey: body.idempotencyKey || req.get('Idempotency-Key')
    });

    return res.status(200).json({ success: true, message: "share created", data: share, code: 200 });
}));

export default router;
