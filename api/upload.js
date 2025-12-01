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
    // Parse multipart form
    const form = new IncomingForm({
      maxFileSize: 10 * 1024 * 1024,
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
    if (!category || category.trim() === "") category = "uncategorized";
    const normalizedCategory = category.toLowerCase().trim();

    // OTHER FIELDS
    const title = Array.isArray(fields.title) ? fields.title[0] : fields.title || "Untitled";
    const description = Array.isArray(fields.description)
      ? fields.description[0]
      : fields.description || "";

    // Validate image type
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.mimetype)) {
      return res.status(400).json({ error: "Invalid file type" });
    }

    // Read file
    const fs = await import("fs");
    const buffer = fs.readFileSync(file.filepath);
    const blob = new Blob([buffer], { type: file.mimetype });

    // Upload preset
    const uploadPresetName = "gangajal_preset";

    // Prepare data for Cloudinary
    const cloudForm = new FormData();
    cloudForm.append("file", blob);
    cloudForm.append("upload_preset", uploadPresetName);

    // Store category correctly
    const folder = `gangajal-portfolio/${normalizedCategory}`;
    cloudForm.append("folder", folder);

    // Tags
    cloudForm.append(
      "tags",
      `${normalizedCategory},portfolio,gangajal,${title.replace(/\s+/g, "_")}`
    );

    // Context
    cloudForm.append(
      "context",
      `title=${title}|description=${description}|category=${normalizedCategory}`
    );

    // Public ID
    const publicId = `${normalizedCategory}_${title.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`;
    cloudForm.append("public_id", publicId);

    // Upload URL
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

    // Upload to Cloudinary
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: cloudForm,
      signal: AbortSignal.timeout(30000),
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

    return res.status(200).json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      folder,
      category: normalizedCategory,
      width: result.width,
      height: result.height,
      size: result.bytes,
      created_at: result.created_at,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Upload failed", details: err.message });
  }
}
