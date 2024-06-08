const express = require('express');
const router = express.Router();
const shares = require("../../database/schemas/shares")
const uuid = require("uuid");
const generateRandomName = require ('../../functions/generateRandomName');

router.post("/share", async(req, res) => {
    try {
        const { content, isPrivate} = req.body;
        let {title, description} = req.body;
        if(!content || isPrivate) {
            return res.status(400).json({success: false, message: "content, isPrivate is required", code: 400})
        }

        if(typeof isPrivate !== "boolean") {
            return res.status(400).json({success: false, message: "isPrivate should be boolean", code: 400})
        }
        if(!title) {
            title = generateRandomName()
        }
        if(!description) {
            description = null;
        }

        if(title && title.length > 70) {
            return res.status(400).json({success: false, message: "title exceeds max content length", code: 400})
        }

        if(description && description.length > 180) {
            return res.status(400).json({success: false, message: "description exceeds max content length", code: 400})
        }

        const shareId = uuid.v4();
        const shareObject = {
            _id: shareId,
            title: title,
            description: description,
            content: content,
            createdAt: Date.now(),
            views: [],
            private: isPrivate
        }
        await shares.create(shareObject)
        return res.status(200).json({success: true, message: "share created", data: shareObject, code: 200})

    } catch(e) {
        console.error(e)
        return res.status(500).json({success: false, message: "internal server error", code: 500})
    }
})

module.exports = router;