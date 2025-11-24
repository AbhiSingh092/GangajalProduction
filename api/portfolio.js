// Portfolio API endpoint
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

export default function handler(req, res) {
  if (req.method === 'GET') {
    console.log('[/api/portfolio] Returning', portfolioItems.length, 'items');
    return res.status(200).json(portfolioItems);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}