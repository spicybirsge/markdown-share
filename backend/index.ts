import config from './config';
import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import axios from 'axios';
import type { Readable } from 'node:stream';

import errorHandler from './middleware/errorHandler';
import { connectDB } from './database/connector';
import createRouter from './routes/v1/create';
import readRouter from './routes/v1/read';
import mcpRouter from './routes/mcp';
import type { ApiHandler } from './types/api';

const app = express();
app.use(express.json({ limit: config.jsonBodyLimit }));
app.use(express.urlencoded({ extended: false, limit: config.jsonBodyLimit }));
app.use(logger('combined'));
app.use(cors());
app.set('json spaces', 1)
if(config.isProduction) {
    app.set('trust proxy', true); 
}


app.use('/api/v1/create', createRouter);
app.use('/api/v1/read', readRouter);
app.use('/mcp', mcpRouter);

const proxy: ApiHandler = async(req, res) => {
     try {
    const { url } = req.query;

    if (!url) return res.status(400).json({success:false, message: 'url is required', code:400});
    if (typeof url !== 'string') return res.status(400).json({success:false, message: 'Invalid URL', code:400});

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

    const isPrivate = (ip: string): boolean =>
      ip.startsWith("127.") ||
      ip.startsWith("10.") ||
      ip.startsWith("192.168.") ||
      ip.startsWith("172.16.") ||
      ip.startsWith("169.254.");

    if (ips.some(i => isPrivate(i.address))) {
      return res.status(403).send({success:false, message: "Blocked host", code:403});
    }

    const response = await axios.get<Readable>(url, {
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

};

app.get('/proxy', proxy);

app.get('/status', ((_req, res) => {
    res.status(200).json({success: true, message: "All systems operational.", code: 200})
}) satisfies ApiHandler);

app.all('*', ((_req, res) => {
    
    res.status(404).json({success: false, message: "No matching route found.", code: 404})

}) satisfies ApiHandler);

// Must be registered after every route and the 404 handler to run as error
// middleware. Placing it earlier makes Express treat it as normal middleware.
app.use(errorHandler);


const PORT = config.port;

export = app;

// Imported by the serverless platform, where the request handler is the export
// above and the process never listens on a port.
if (require.main === module) {
    connectDB().catch((error) => {
        console.error('[x] Database connection failed:', error.message);
    });

    app.listen(PORT, () => {
        console.log(`[^] Server is running on port ${PORT} in ${config.env} mode`);
    })
}
