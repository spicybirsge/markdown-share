if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const axios = require("axios");

const errorHandler = require('./middleware/errorHandler');
require('./database/connector')();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('combined'));
app.use(cors());
app.use(errorHandler);
app.set('json spaces', 1)
if(process.env.NODE_ENV === 'production') {
    app.set('trust proxy', true); 
}


app.use('/api/v1/create', require('./routes/v1/create'));
app.use('/api/v1/read', require('./routes/v1/read'));

app.get("/proxy", async(req, res) => {
     try {
    const { url } = req.query;

    if (!url) return res.status(400).json({success:false, message: 'url is required', code:400});

    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return res.status(400).json({success:false, message: "Invalid URL", code:400});
    }

    if (parsed.protocol != "https:") {
      return res.status(400).send({success:false, message: "Only https is allowed", code:400});
    }

    // basic SSRF guard (minimum viable)
    const dns = await import("dns/promises");
    const ips = await dns.lookup(parsed.hostname, { all: true });

    const isPrivate = (ip) =>
      ip.startsWith("127.") ||
      ip.startsWith("10.") ||
      ip.startsWith("192.168.") ||
      ip.startsWith("172.16.") ||
      ip.startsWith("169.254.");

    if (ips.some(i => isPrivate(i.address))) {
      return res.status(403).send({success:false, message: "Blocked host", code:400});
    }

    const response = await axios.get(url, {
      responseType: "stream",
      maxRedirects: 0,
      timeout: 5000
    });

    const ct = response.headers["content-type"] || "";

    if (!ct.startsWith("image/")) {
      return res.status(400).send({success:false, message: "Only proxying images are allowed", code:400});
    }

    res.setHeader("Content-Type", ct);
    response.data.pipe(res);

  } catch (e) {
    console.error(e);
      return res.status(500).json({ success: false, message: "Internal server error", code: 500 })
  }

})

app.get('/status', async (req, res) => {
    res.status(200).json({success: true, message: "All systems operational.", code: 200})
})

app.all('*', async (req, res) => {
    
    res.status(404).json({success: false, message: "No matching route found.", code: 404})

})


const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`[^] Server is running on port ${PORT} in ${process.env.NODE_ENV || "developement"} mode`);
})