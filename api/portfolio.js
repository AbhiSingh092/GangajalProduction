// MAIN Portfolio API - Single source of truth
// This file contains BOTH the data AND the API endpoint

// Portfolio data store
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

// Helper functions
export const getPortfolioItems = () => {
  return [...portfolioItems];
};

export const addPortfolioItem = (item) => {
  const newItem = {
    id: itemIdCounter++,
    ...item,
    createdAt: new Date().toISOString()
  };
  portfolioItems.push(newItem);
  return newItem;
};

export const deletePortfolioItem = (id) => {
  const index = portfolioItems.findIndex(item => item.id === parseInt(id));
  if (index > -1) {
    const deletedItem = portfolioItems.splice(index, 1)[0];
    return deletedItem;
  }
  return null;
};

// API endpoint handler
export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const portfolioData = getPortfolioItems();
      console.log('[/api/portfolio] Returning', portfolioData.length, 'items');
      return res.status(200).json(portfolioData);
    } catch (error) {
      console.error('[/api/portfolio] Error:', error);
      return res.status(500).json({ error: 'Failed to load portfolio' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}