import { v2 as cloudinary } from "cloudinary";
import { config } from "../config";

function initializeCloudinary() {
  const { cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret } = config;

  if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
    throw new Error(
      "Cloudinary configuration is missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables."
    );
  }

  cloudinary.config({
    cloud_name: cloudinaryCloudName,
    api_key: cloudinaryApiKey,
    api_secret: cloudinaryApiSecret,
    secure: true,
  });

  return cloudinary;
}

export const cloudinaryInstance = initializeCloudinary();

export const ALLOWED_CLOUDINARY_FORMATS = ["jpg", "jpeg", "png", "webp", "avif"];

export const CLOUDINARY_FOLDERS = {
  articles: "dnews-africa/articles",
  authors: "dnews-africa/authors",
  categories: "dnews-africa/categories",
  logos: "dnews-africa/logos",
  sponsors: "dnews-africa/sponsors",
} as const;

export type CloudinaryFolder = keyof typeof CLOUDINARY_FOLDERS;
