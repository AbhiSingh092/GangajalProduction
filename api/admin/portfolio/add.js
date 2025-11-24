// Add new portfolio item endpoint
let portfolioItems = [
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

// Simple token validation
const validateAdminToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.substring(7);
  return token === 'admin-token-secret';
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Validate admin token
    if (!validateAdminToken(req)) {
      return res.status(401).json({ error: 'Invalid or missing authorization token' });
    }

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
    return res.status(200).json(newItem);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}