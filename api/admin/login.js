// Admin login API endpoint
const ADMIN_PASSWORD = 'Gangajal@2024';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }
    
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Return a simple token on successful login
    return res.status(200).json({ 
      token: 'admin-token-secret', 
      message: 'Login successful' 
    });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}