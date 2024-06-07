const express = require('express');
const router = express.Router();

router.put("/example", async(req, res) => {
    return res.json({success: true, message: "hello world", code: 200})
})

module.exports = router;