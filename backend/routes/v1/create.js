const express = require('express');
const router = express.Router();
const { createShare } = require('../../services/shares');
const asyncHandler = require('../../middleware/asyncHandler');

router.post('/share', asyncHandler(async (req, res) => {
    const body = req.body || {};

    const share = await createShare({
        content: body.content,
        title: body.title,
        description: body.description,
        isUnlisted: body.isUnlisted
    });

    return res.status(200).json({ success: true, message: "share created", data: share, code: 200 });
}));

module.exports = router;
