import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload directory - at project root level
const UPLOAD_DIR = path.join(__dirname, "../../uploads");

// Ensure upload directories exist
const ensureUploadDirs = () => {
  const dirs = [
    UPLOAD_DIR,
    path.join(UPLOAD_DIR, "documents"),
    path.join(UPLOAD_DIR, "comments"),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize directories on module load
ensureUploadDirs();

/**
 * Save file to local storage
 * @param {Buffer} buffer - File buffer
 * @param {string} originalName - Original filename
 * @param {string} folder - Subfolder (documents, comments)
 * @returns {Promise<{url: string, filename: string, path: string}>}
 */
export const handleLocalUpload = async (buffer, originalName, folder = "documents") => {
  ensureUploadDirs();

  // Generate unique filename
  const ext = path.extname(originalName);
  const base = path.basename(originalName, ext).replace(/[^a-zA-Z0-9-_]/g, "_");
  const timestamp = Date.now();
  const uniqueFilename = `${base}-${timestamp}${ext}`;

  // Full path
  const filePath = path.join(UPLOAD_DIR, folder, uniqueFilename);

  // Write file
  await fs.promises.writeFile(filePath, buffer);

  // Return URL path (relative to server)
  const url = `/uploads/${folder}/${uniqueFilename}`;

  return {
    url,
    filename: originalName,
    storedFilename: uniqueFilename,
    path: filePath,
  };
};

/**
 * Delete file from local storage
 * @param {string} url - File URL path
 */
export const deleteLocalFile = async (url) => {
  try {
    // Convert URL to file path
    const relativePath = url.replace(/^\/uploads\//, "");
    const filePath = path.join(UPLOAD_DIR, relativePath);

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    // Don't throw - file might already be deleted
  }
};

export default {
  handleLocalUpload,
  deleteLocalFile,
  UPLOAD_DIR,
};
