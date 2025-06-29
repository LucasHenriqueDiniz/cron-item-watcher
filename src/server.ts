import http from 'http';
import { runItemCheck } from './index.js';
import config from "./config.js";
import { initDatabase } from './database.js';

// Default check interval (15 minutes)
const DEFAULT_CHECK_INTERVAL_MS = 15 * 60 * 1000;

// Server state
let isCheckRunning = false;
let lastCheckTime: Date | null = null;
let nextCheckTime: Date | null = null;

// Create HTTP server
const server = http.createServer((req, res) => {
  // Simple status endpoint
  if (req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'running',
      lastCheckTime: lastCheckTime ? lastCheckTime.toISOString() : null,
      nextCheckTime: nextCheckTime ? nextCheckTime.toISOString() : null,
      isCheckRunning,
    }));
    return;
  }

  // Default response
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Item Watcher Server Running');
});

// Run item check at specified intervals
async function scheduleItemCheck() {
  // Check if we're already running
  if (isCheckRunning) {
    console.log('Item check already in progress, skipping this run');
    return;
  }

  try {
    console.log('Starting scheduled item check');
    isCheckRunning = true;
    
    // Run the item check
    await runItemCheck();
    
    // Update state
    lastCheckTime = new Date();
    
  } catch (error) {
    console.error('Error in scheduled item check:', error);
  } finally {
    isCheckRunning = false;
    
    // Schedule next check
    const interval = process.env.CHECK_INTERVAL_MS ? 
      parseInt(process.env.CHECK_INTERVAL_MS) : 
      DEFAULT_CHECK_INTERVAL_MS;
    
    nextCheckTime = new Date(Date.now() + interval);
    console.log(`Next check scheduled for ${nextCheckTime.toISOString()} (in ${interval/60000} minutes)`);
    
    setTimeout(scheduleItemCheck, interval);
  }
}

// Start the server
async function startServer() {
  // Initialize database first
  await initDatabase();
  
  // Start HTTP server
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Status endpoint available at http://localhost:${port}/status`);
    
    // Run first item check immediately
    scheduleItemCheck();
  });
}

// Handle shutdown
process.on('SIGINT', () => {
  console.log('Gracefully shutting down...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Gracefully shutting down...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});

// Start the server
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
