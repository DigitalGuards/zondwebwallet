import express from 'express';
import NodeCache from 'node-cache';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const cache = new NodeCache({ stdTTL: 10 }); // Cache for 10 seconds

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://qrlwallet.com' : 'http://localhost:5173'
}));

// RPC endpoints configuration
const RPC_ENDPOINTS = {
  dev: 'http://localhost:8545',
  testnet: 'http://209.250.255.226:8545',
  mainnet: 'http://mainnet.zond.network:8545'
};

// Helper function to make RPC calls
async function makeRPCCall(endpoint, method, params) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Generic RPC handler with caching
app.post('/api/zond-rpc/:network', async (req, res) => {
  try {
    const { network } = req.params;
    const { method, params } = req.body;

    if (!RPC_ENDPOINTS[network]) {
      return res.status(400).json({ error: 'Invalid network' });
    }

    // Create cache key from network, method and params
    const cacheKey = `${network}-${method}-${JSON.stringify(params)}`;
    
    // Check cache first
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    // Make RPC call if not in cache
    const result = await makeRPCCall(RPC_ENDPOINTS[network], method, params);
    
    // Cache the result
    cache.set(cacheKey, result);
    
    res.json(result);
  } catch (error) {
    console.error('RPC Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
