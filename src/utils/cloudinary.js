import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const handleUpload = async (buffer, originalName) => {
  return new Promise((resolve, reject) => {
    const base = originalName.replace(/\.[^/.]+$/, "");
    const timestamp = Date.now();
    const publicId = `${base}-${timestamp}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw", // Use "raw" for non-image files like DWG, PDF, etc.
        folder: "documents",
        public_id: publicId,
        overwrite: false,
        unique_filename: false,
        access_mode: "public",
        timeout: 120000, // 2 minutes timeout for large files
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }
        resolve({ ...result, public_id: publicId });
      }
    );

    uploadStream.on('error', (error) => {
      console.error("Upload stream error:", error);
      reject(error);
    });

    uploadStream.end(buffer);
  });
};

export default cloudinary;