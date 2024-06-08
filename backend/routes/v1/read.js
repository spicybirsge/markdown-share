const express = require('express');
const router = express.Router();
const shares = require("../../database/schemas/shares")

router.get("/share", async(req, res) => {
    try { 
        const {id} = req.query;
        let {metafetch} = req.query;
       
        if(!id) {
            return res.status(400).json({success:false, message: "id is required", code: 400})
        }
        const share = await shares.findOne({_id: id})
        if(!share) {
            return res.status(404).json({success:false, message: "share not found", code: 404})
        }
        if(!metafetch) {
            metafetch = false;
        }

        if(!metafetch && !share.views.includes(req.ip)) {
            share.views.push(req.ip)
            await share.save()

        }
        const shareObject = {
            _id: share._id,
            title: share.title,
            content: share.content,
            createdAt: share.createdAt,
            views: share.views.length,
            unlisted: share.unlisted
        }
       
        return res.status(200).json({success: true, message: "share found", data: shareObject, code: 200})
     } catch(e) {
        console.error(e)
        return res.status(500).json({success: false, message: "internal server error", code: 500})
    }
})

module.exports = router;