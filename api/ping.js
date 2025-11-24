// Ping endpoint for testing
export default function handler(req, res) {
  if (req.method === 'GET') {
    const hasKey = !!(process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY.trim());
    const hasSecret = !!(process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_API_SECRET.trim());
    const liveHasCreds = hasKey && hasSecret;
    
    return res.status(200).json({ 
      ok: true, 
      env: { 
        cloud_name: process.env.CLOUD_NAME || 'dcsc5ij9o', 
        has_creds: liveHasCreds,
        vercel: !!process.env.VERCEL
      } 
    });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}