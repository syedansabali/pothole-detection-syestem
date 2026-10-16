console.log('SERVER FILE STARTED')
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

const app = express();
app.use(express.json());

// Create a plain HTTP server so Express and WebSocket can share the same port
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Keep track of every browser tab currently connected
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  console.log('Frontend connected via WebSocket');
  clients.add(ws);

  ws.on('close', () => {
    console.log('Frontend disconnected');
    clients.delete(ws);
  });
});

// Helper: send data to every connected browser tab
function broadcast(data: object) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// This is the endpoint your hardware (or a test script) will POST sensor data to
app.post('/api/telemetry', (req, res) => {
  console.log('Received telemetry:', req.body);
  broadcast(req.body);
  res.json({ status: 'ok' });
});

// This is the endpoint hardware will POST a detected hazard (pothole/obstacle) to
app.post('/api/hazard', (req, res) => {
  console.log('Received hazard:', req.body);
  broadcast({ type: 'hazard', payload: req.body });
  res.json({ status: 'ok' });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});