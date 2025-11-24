import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import multer from 'multer';
import FormData from 'form-data';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

// Load .env from server/ directory explicitly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');

// Ensure dotenv loads from the exact server/.env path with override flag
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: true });
} else {
  console.warn(`Warning: ${envPath} not found; using process.env`);
}

// Fallback: manually parse .env if dotenv didn't populate credentials (for debugging/edge cases)
if (!process.env.CLOUDINARY_API_KEY && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        process.env[key.trim()] = value;
      }
    }
  }
}

// Debug: report what was loaded (mask secrets)
console.log('[server] .env path:', envPath, 'exists:', fs.existsSync(envPath));
console.log('[server] env check: CLOUD_NAME=', process.env.CLOUD_NAME || 'undefined',
  'API_KEY_len=', (process.env.CLOUDINARY_API_KEY || '').length,
  'API_SECRET_len=', (process.env.CLOUDINARY_API_SECRET || '').length);

const app = express();
app.use(express.json());

// multer for handling multipart/form-data (file uploads)
const upload = multer({ storage: multer.memoryStorage() });

const PORT = process.env.PORT || 3000;
const CLOUD_NAME = process.env.CLOUD_NAME || 'dbz9tnzid';
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!API_KEY || !API_SECRET) {
  console.warn('Warning: CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are not set. Admin routes will fail.');
}

// Generate Cloudinary signature for authenticated uploads
const generateSignature = (params, secret) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return crypto.createHash('sha1').update(sortedParams + secret).digest('hex');
};

const authHeader = () => {
  // Check process.env directly so we pick up the fallback parser's loads
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!key || !secret) return null;
  return { username: key, password: secret };
};

// In-memory storage for portfolio items
const portfolioItems = [
  {
    id: 1,
    title: 'Sample Wedding Photography',
    category: 'event',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=400&fit=crop',
    description: 'Beautiful wedding moments captured',
    createdAt: new Date().toISOString()
  }
];
let itemIdCounter = 2;

// Admin password (hardcoded for now; move to .env in production)
const ADMIN_PASSWORD = 'Gangajal@2024';

// Simple token validation middleware
const validateAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.substring(7);
  if (token !== 'admin-token-secret') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  next();
};

// Public route used by the frontend to list media for a category
app.get('/api/media/:category', async (req, res) => {
  const category = req.params.category;
  try {
    const auth = authHeader();
    const response = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/search`, {
      expression: `tags:${category}`,
      sort_by: [{ uploaded_at: 'desc' }],
      max_results: 500
    }, {
      headers: { 'Content-Type': 'application/json' },
      // use axios auth option if available
      ...(auth ? { auth } : {})
    });

    const resources = response.data.resources || [];
    // return only the fields the frontend needs
    const mapped = resources.map(r => ({ secure_url: r.secure_url, resource_type: r.resource_type, public_id: r.public_id, tags: r.tags }));
    res.json(mapped);
  } catch (err) {
    // Verbose logging for debugging: include HTTP status and response body if available
    console.error('Error /api/media: calling resources/search for tag=', category, 'status=', err?.response?.status, 'data=', JSON.stringify(err?.response?.data || err.message || err));
    res.status(500).json({ error: 'Failed to fetch media', details: err?.response?.data || err.message });
  }
});

// Simple ping route to verify the proxy is reachable
app.get('/api/ping', (req, res) => {
  // Check process.env directly (not the stale module constants set at startup)
  const hasKey = !!(process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY.trim());
  const hasSecret = !!(process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_API_SECRET.trim());
  const liveHasCreds = hasKey && hasSecret;
  res.json({ ok: true, env: { cloud_name: process.env.CLOUD_NAME || CLOUD_NAME, has_creds: liveHasCreds } });
});

// Server-side upload endpoint: signs and forwards uploads to Cloudinary so tags/context are reliably set
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file required' });
  if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return res.status(500).json({ error: 'Server credentials not configured' });
  }

  const category = req.body.category || req.query.category || 'uncategorized';
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signatureParams = {
      context: `category=${category}`,
      tags: category,
      timestamp: timestamp
    };

    const signature = generateSignature(signatureParams, process.env.CLOUDINARY_API_SECRET);

    const form = new FormData();
    form.append('file', req.file.buffer, { filename: req.file.originalname, contentType: req.file.mimetype });
    form.append('tags', category);
    form.append('context', `category=${category}`);
    form.append('api_key', process.env.CLOUDINARY_API_KEY);
    form.append('timestamp', timestamp);
    form.append('signature', signature);

    const uploadUrl = req.file.mimetype.startsWith('video')
      ? `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`
      : `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    const response = await axios.post(uploadUrl, form, {
      headers: form.getHeaders()
    });

    console.log('[/api/upload] Success:', response.data.secure_url);
    // Return the Cloudinary result to the client
    res.json(response.data);
  } catch (err) {
    console.error('Error /api/upload:', err?.response?.status, err?.response?.data || err.message || err);
    res.status(500).json({ error: 'Upload failed', details: err?.response?.data?.error?.message || err.message });
  }
});

// Admin route that returns full resources for management UI
app.get('/api/admin/media/:category', async (req, res) => {
  if (!authHeader()) return res.status(401).json({ error: 'Server missing Cloudinary credentials' });
  const category = req.params.category;
  try {
    const auth = authHeader();
    const response = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/search`, {
      expression: `tags:${category}`,
      sort_by: [{ uploaded_at: 'desc' }],
      max_results: 500
    }, {
      headers: { 'Content-Type': 'application/json' },
      ...(auth ? { auth } : {})
    });

    const resources = response.data.resources || [];
    res.json(resources);
  } catch (err) {
    console.error('Error /api/admin/media: calling resources/search for tag=', category, 'status=', err?.response?.status, 'data=', JSON.stringify(err?.response?.data || err.message || err));
    res.status(500).json({ error: 'Failed to fetch admin media', details: err?.response?.data || err.message });
  }
});

// Admin delete endpoint (POST) to delete resources by public_ids
app.post('/api/admin/delete', async (req, res) => {
  if (!authHeader()) return res.status(401).json({ error: 'Server missing Cloudinary credentials' });
  const { public_ids, resource_type = 'image' } = req.body;
  if (!Array.isArray(public_ids) || public_ids.length === 0) return res.status(400).json({ error: 'public_ids required' });

  try {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/${resource_type}/upload`;
    const auth = authHeader();
    const response = await axios.delete(url, {
      headers: { 'Content-Type': 'application/json' },
      ...(auth ? { auth } : {}),
      data: { public_ids }
    });
    res.json(response.data);
  } catch (err) {
    console.error('Error /api/admin/delete: status=', err?.response?.status, 'data=', JSON.stringify(err?.response?.data || err.message || err));
    res.status(500).json({ error: 'Delete failed', details: err?.response?.data || err.message });
  }
});

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  // Return a simple token on successful login
  res.json({ token: 'admin-token-secret', message: 'Login successful' });
});

// Get all portfolio items (public route)
app.get('/api/portfolio', (req, res) => {
  console.log('[/api/portfolio] Returning', portfolioItems.length, 'items');
  res.json(portfolioItems);
});

// Add portfolio item (protected route)
app.post('/api/admin/portfolio/add', validateAdminToken, (req, res) => {
  const { title, category, imageUrl, description } = req.body;
  
  if (!title || !category || !imageUrl) {
    return res.status(400).json({ error: 'title, category, and imageUrl are required' });
  }

  const newItem = {
    id: itemIdCounter++,
    title,
    category,
    imageUrl,
    description: description || '',
    createdAt: new Date().toISOString()
  };

  portfolioItems.push(newItem);
  res.json(newItem);
});

// Delete portfolio item (protected route)
app.delete('/api/admin/portfolio/:id', validateAdminToken, (req, res) => {
  const { id } = req.params;
  const index = portfolioItems.findIndex(item => item.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ error: 'Portfolio item not found' });
  }

  const deletedItem = portfolioItems.splice(index, 1);
  res.json({ message: 'Item deleted', item: deletedItem[0] });
});

// Get all portfolio items for admin (protected route)
app.get('/api/admin/portfolio', validateAdminToken, (req, res) => {
  res.json(portfolioItems);
});

app.listen(PORT, () => {
  console.log(`Cloudinary proxy server listening on http://localhost:${PORT}`);
});
