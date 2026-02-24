const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { exec } = require('child_process');
const os = require('os');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const app = express();
const fs = require('fs');

// Real-time data state
let alerts = [];
let logs = [];
let networkData = {
  timestamp: Date.now(),
  interfaces: [],
  total: {
    rxBytesPerSec: 0,
    txBytesPerSec: 0
  }
};
const prevCounters = {};

// REST API Endpoints
app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

app.get('/api/logs', (req, res) => {
  res.json(logs);
});

app.get('/api/traffic', (req, res) => {
  res.json(trafficData);
});

app.get('/api/network', (req, res) => {
  res.json(networkData);
});

// Health endpoint - simple per-service checks derived from current data
function computeHealth() {
  const criticalAlerts = alerts.filter(a => a.severity === 'Critical').length;
  const errorLogs = logs.filter(l => l.level === 'ERROR').length;
  const highNetwork = (networkData.total.rxBytesPerSec + networkData.total.txBytesPerSec) > (10 * 1024 * 1024); // >10MB/s

  const now = new Date().toISOString();
  return {
    timestamp: now,
    services: {
      Firewall: { status: errorLogs > 10 ? 'Degraded' : 'Operational', uptime: errorLogs > 10 ? '98.5%' : '99.9%', lastChecked: now },
      'IDS Engine': { status: criticalAlerts > 0 ? 'Degraded' : 'Operational', uptime: criticalAlerts > 0 ? '98.0%' : '99.8%', lastChecked: now },
      'Traffic Monitor': { status: highNetwork ? 'Degraded' : 'Operational', uptime: highNetwork ? '99.0%' : '100%', lastChecked: now },
      'Alert System': { status: criticalAlerts > 0 ? 'Degraded' : 'Operational', uptime: criticalAlerts > 0 ? '97.5%' : '99.7%', lastChecked: now }
    }
  }
}

app.get('/api/health', (req, res) => {
  res.json(computeHealth());
});

// Root API endpoint - helpful message for humans visiting the backend
app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Realtime backend running',
    routes: ['/api/alerts', '/api/logs', '/api/traffic', '/api/network', '/api/health'],
    websocket: `ws://${req.hostname}:${(server.address && server.address().port) || process.env.PORT || 5001}`,
  });
});

// All other GET requests handled by Next.js
app.get('*', (req, res) => {
  return handle(req, res);
});



// Network sampling for macOS (uses `netstat -ib`) - computes bytes/sec
function sampleNetworkStats() {
  exec('netstat -ib', (err, stdout) => {
    if (err) return;
    const lines = stdout.split('\n');
    const seen = {};
    const now = Date.now();
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 2) return;
      const name = parts[0];
      // skip header lines
      if (name === 'Name' || name === 'Iface' || name === "lo0") return;
      // Extract numeric tokens from the line
      const nums = parts.filter(p => /^\d+$/.test(p)).map(n => parseInt(n, 10));
      if (nums.length < 2) return;
      // Heuristic: last two numeric columns are ibytes and obytes on many macOS netstat outputs
      const ibytes = nums[nums.length - 2];
      const obytes = nums[nums.length - 1];

      if (!seen[name]) {
        seen[name] = { rx: 0, tx: 0 };
      }
      seen[name].rx += ibytes;
      seen[name].tx += obytes;
    });

    // Build networkData and compute rates
    const interfaces = [];
    let totalRx = 0;
    let totalTx = 0;
    Object.keys(seen).forEach((iface) => {
      const counters = seen[iface];
      const prev = prevCounters[iface] || { rx: counters.rx, tx: counters.tx, ts: now };
      const dt = Math.max((now - prev.ts) / 1000, 0.001);
      const rxDelta = Math.max(counters.rx - prev.rx, 0);
      const txDelta = Math.max(counters.tx - prev.tx, 0);
      const rxRate = rxDelta / dt; // bytes/sec
      const txRate = txDelta / dt; // bytes/sec

      interfaces.push({ name: iface, rxBytes: counters.rx, txBytes: counters.tx, rxRate, txRate });
      totalRx += rxRate;
      totalTx += txRate;

      prevCounters[iface] = { rx: counters.rx, tx: counters.tx, ts: now };
    });

    networkData = {
      timestamp: now,
      interfaces,
      total: {
        rxBytesPerSec: totalRx,
        txBytesPerSec: totalTx
      }
    };
  });
}

// Initial sample and periodic sampling every 1s
sampleNetworkStats();
setInterval(sampleNetworkStats, 1000);

const START_PORT = parseInt(process.env.PORT, 10) || 5001;

function startServerWithFallback(port, maxAttempts = 10) {
  let attempt = 0;

  function tryListen(p) {
    const onError = (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.warn(`Port ${p} in use, trying ${p + 1}...`);
        attempt += 1;
        if (attempt >= maxAttempts) {
          console.error('No available ports found after', maxAttempts, 'attempts');
          process.exit(1);
        }
        // small delay before retrying
        setTimeout(() => tryListen(p + 1), 200);
      } else {
        console.error('Server failed to start:', err);
        process.exit(1);
      }
    };

    server.once('error', onError);
    server.listen(p, () => {
      server.removeListener('error', onError);
      console.log(`🚀 Unified Web Server running on http://localhost:${p}`);
      console.log(`📡 WebSocket API running on ws://localhost:${p}`);
      try {
        fs.writeFileSync('.backend-port', String(p), 'utf8');
      } catch (e) {
        console.warn('Failed to write .backend-port file', e);
      }
    });
  }

  nextApp.prepare().then(() => {
    // Only bind endpoints to server after Next is prepared
    const serverInstance = http.createServer(app);
    const wssInstance = new WebSocket.Server({ server: serverInstance });

    // WebSocket Connection
    wssInstance.on('connection', (ws) => {
      console.log('New WebSocket client connected');
      ws.send(JSON.stringify({
        type: 'initial-data',
        data: { alerts, logs, networkData }
      }));
      ws.on('close', () => {
        console.log('Client disconnected');
      });
    });

    // Broadcast function inside scope
    function broadcastUpdate(type, data) {
      wssInstance.clients.forEach(wsClient => {
        if (wsClient.readyState === WebSocket.OPEN) {
          wsClient.send(JSON.stringify({ type, data }));
        }
      });
    }

    // Move the set intervals inside so they use the new wssInstance
    setInterval(() => {
      broadcastUpdate('network-update', networkData);
      const health = computeHealth();
      broadcastUpdate('health-update', health);
    }, 1000);

    // Overwrite the original global variable so POST /api/alerts/... has access to scope
    global.broadcastUpdateGlobal = broadcastUpdate;

    serverInstance.once('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        tryListen(p + 1);
      }
    });

    // Patch Express to use our explicit broadcast function
    app.post('/api/alerts/:id/status', (req, res) => {
      const { id } = req.params;
      const { status } = req.body;
      const alert = alerts.find(a => a.id === id);
      if (alert) {
        alert.status = status;
        global.broadcastUpdateGlobal('alert-updated', alert);
        res.json(alert);
      } else {
        res.status(404).json({ error: 'Alert not found' });
      }
    });

    // Set `server` explicitly for `tryListen`
    global.server = serverInstance;
    tryListen(port);
  });
}

startServerWithFallback(START_PORT);
