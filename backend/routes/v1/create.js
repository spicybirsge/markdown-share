const express = require('express');
const router = express.Router();

router.post("/example", async(req, res) => {
    return res.json({success: true, message: "hello world", code: 200})
})

module.exports = router;