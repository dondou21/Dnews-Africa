import { v2 as cloudinary } from "cloudinary";
import { config } from "../config";

let _instance: typeof cloudinary | null = null;

function initializeCloudinary(): typeof cloudinary | null {
  const { cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret } = config;

  if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
    return null;
  }

  cloudinary.config({
    cloud_name: cloudinaryCloudName,
    api_key: cloudinaryApiKey,
    api_secret: cloudinaryApiSecret,
    secure: true,
  });

  return cloudinary;
}

export function getCloudinaryInstance(): typeof cloudinary | null {
  if (_instance === null) {
    _instance = initializeCloudinary();
  }
  return _instance;
}

export const ALLOWED_CLOUDINARY_FORMATS = ["jpg", "jpeg", "png", "webp", "avif"];

export const CLOUDINARY_FOLDERS = {
  articles: "dnews-africa/articles",
  authors: "dnews-africa/authors",
  categories: "dnews-africa/categories",
  logos: "dnews-africa/logos",
  sponsors: "dnews-africa/sponsors",
} as const;

export type CloudinaryFolder = keyof typeof CLOUDINARY_FOLDERS;
