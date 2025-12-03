// Generate Cloudinary signature for direct browser uploads
// This bypasses Vercel's 4.5MB limit by uploading directly to Cloudinary
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } = process.env;

  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
    return res.status(500).json({
      error: "Server config error",
      details: "Cloudinary environment variables missing",
    });
  }

  try {
    const { category, title, description } = req.body;

    // Validate category
    const validCategories = ['commercial', 'travel', 'fashion', 'event', 'product'];
    const finalCategory = validCategories.includes(category?.toLowerCase()) 
      ? category.toLowerCase() 
      : 'product';

    // Generate upload parameters
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `gangajal-portfolio/${finalCategory}`;
    const publicId = `${finalCategory}_${title.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`;
    const tags = `${finalCategory},portfolio,gangajal,${title.replace(/\s+/g, "_")}`;
    const context = `title=${title}|description=${description}|category=${finalCategory}`;

    // Create signature
    const paramsToSign = `context=${context}&folder=${folder}&public_id=${publicId}&tags=${tags}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign + CLOUDINARY_API_SECRET)
      .digest("hex");

    console.log(`[Upload Signature] Generated for category: ${finalCategory}`);

    // Return signature and upload parameters
    return res.status(200).json({
      signature,
      timestamp,
      folder,
      public_id: publicId,
      tags,
      context,
      api_key: CLOUDINARY_API_KEY,
      cloud_name: CLOUDINARY_CLOUD_NAME,
    });
  } catch (err) {
    console.error('[Upload Signature] Error:', err);
    return res.status(500).json({ error: "Failed to generate signature", details: err.message });
  }
}
