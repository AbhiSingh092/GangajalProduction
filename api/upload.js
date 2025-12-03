// FIXED + CLEANED Cloudinary Upload API (Next.js)
// Handles categories correctly, no more wrong 'product' issue.

import { IncomingForm } from "formidable";
import crypto from "crypto";

// Disable default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

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
    // Parse multipart form (increased size for videos)
    const form = new IncomingForm({
      maxFileSize: 100 * 1024 * 1024, // 100MB for videos
      keepExtensions: true,
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, f, fl) => (err ? reject(err) : resolve([f, fl])));
    });

    // FILE extraction
    const file = files.file?.[0];
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // CATEGORY extraction FIX (THIS WAS THE MAIN ISSUE)
    let category = fields.category;
    if (Array.isArray(category)) category = category[0];
    if (!category || typeof category !== 'string' || category.trim() === "") {
      category = "product"; // default to product instead of uncategorized
    }
    const normalizedCategory = category.toLowerCase().trim();
    
    // Validate against allowed categories
    const validCategories = ['commercial', 'travel', 'fashion', 'event', 'product'];
    const finalCategory = validCategories.includes(normalizedCategory) ? normalizedCategory : 'product';
    
    console.log(`[Upload] Received category: "${fields.category}" → Normalized: "${finalCategory}"`);

    // OTHER FIELDS
    const title = Array.isArray(fields.title) ? fields.title[0] : fields.title || "Untitled";
    const description = Array.isArray(fields.description)
      ? fields.description[0]
      : fields.description || "";

    // Validate file type (images AND videos)
    const allowedImages = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const allowedVideos = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];
    const allAllowed = [...allowedImages, ...allowedVideos];
    
    if (!allAllowed.includes(file.mimetype)) {
      return res.status(400).json({ 
        error: "Invalid file type",
        details: "Only images (JPEG, PNG, WebP, GIF) and videos (MP4, MOV, AVI, WebM) are allowed"
      });
    }

    const isVideo = allowedVideos.includes(file.mimetype);
    const resourceType = isVideo ? "video" : "image";

    // Read file
    const fs = await import("fs");
    const buffer = fs.readFileSync(file.filepath);
    const blob = new Blob([buffer], { type: file.mimetype });

    // Use SIGNED upload (no preset needed)
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `gangajal-portfolio/${finalCategory}`;
    const publicId = `${finalCategory}_${title.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`;
    const tags = `${finalCategory},portfolio,gangajal,${title.replace(/\s+/g, "_")}`;
    const context = `title=${title}|description=${description}|category=${finalCategory}`;

    // Create signature for signed upload (DO NOT include resource_type in signature)
    const paramsToSign = `context=${context}&folder=${folder}&public_id=${publicId}&tags=${tags}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign + CLOUDINARY_API_SECRET)
      .digest("hex");

    console.log(`[Upload] Signature params: ${paramsToSign}`);
    console.log(`[Upload] Signature: ${signature}`);

    // Prepare data for Cloudinary
    const cloudForm = new FormData();
    cloudForm.append("file", blob);
    cloudForm.append("api_key", CLOUDINARY_API_KEY);
    cloudForm.append("timestamp", timestamp.toString());
    cloudForm.append("signature", signature);
    cloudForm.append("folder", folder);
    cloudForm.append("public_id", publicId);
    cloudForm.append("tags", tags);
    cloudForm.append("context", context);

    // Upload URL (different for videos)
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
    
    console.log(`[Upload] Uploading ${resourceType}: ${file.originalFilename} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    // Upload to Cloudinary (longer timeout for videos)
    const timeout = isVideo ? 120000 : 30000; // 2 minutes for videos, 30s for images
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: cloudForm,
      signal: AbortSignal.timeout(timeout),
    });

    // Clean temp file
    try {
      fs.unlinkSync(file.filepath);
    } catch (err) {}

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({
        error: "Cloudinary upload failed",
        details: errText,
      });
    }

    const result = await response.json();

    console.log(`[Upload] SUCCESS: Uploaded to folder "${folder}" with category "${finalCategory}"`);
    
    return res.status(200).json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      folder,
      category: finalCategory,
      resource_type: resourceType,
      width: result.width,
      height: result.height,
      duration: result.duration, // for videos
      size: result.bytes,
      created_at: result.created_at,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Upload failed", details: err.message });
  }
}
