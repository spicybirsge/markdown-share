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
            description: share.description,
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

router.get("/latest-shares", async(req, res) => {
    try { 
        let {limit} = req.query;
        
        if(!limit) {
            limit = 26
        }
        limit = limit*1 
        if(isNaN(limit)) {
            return res.status(400).json({success: false, message: "limit should be a number", code: 200})
        }
        const latestShares = await shares.find({unlisted: false}).sort({ createdAt: -1 }).limit(limit)
        const newShares = []
        for(const sh of latestShares) {
            const data = {
                _id: sh._id,
                title: sh.title,
                description: sh.description,
                content: sh.content,
                createdAt: sh.createdAt,
                views: sh.views.length,
                unlisted: sh.unlisted


            }
            newShares.push(data)
        }

        return res.status(200).json({success:true, message: `latest ${limit} shares`, data: newShares, code: 200})
    } catch(e) {
        console.error(e)
        return res.status(500).json({success: false, message: "internal server error", code: 500})
    }
})

module.exports = router;