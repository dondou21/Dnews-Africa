import { UploadApiResponse } from "cloudinary";
import { getCloudinaryInstance, ALLOWED_CLOUDINARY_FORMATS, CLOUDINARY_FOLDERS, type CloudinaryFolder } from "../lib/cloudinary";
import { AppError } from "../middlewares/errorHandler";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

function validateFile(buffer: Buffer, mimetype: string): void {
  const ext = mimetype.split("/").pop()?.toLowerCase();
  if (!ext || !ALLOWED_CLOUDINARY_FORMATS.includes(ext)) {
    throw new AppError(
      `Invalid file type: ${mimetype}. Allowed formats: ${ALLOWED_CLOUDINARY_FORMATS.join(", ")}`,
      400
    );
  }

  if (buffer.length > MAX_FILE_SIZE) {
    throw new AppError(
      `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      400
    );
  }

  if (buffer.length === 0) {
    throw new AppError("Uploaded file is empty", 400);
  }
}

function withCloudinary<T>(fn: (instance: NonNullable<ReturnType<typeof getCloudinaryInstance>>) => Promise<T>): Promise<T> {
  const instance = getCloudinaryInstance();
  if (!instance) {
    throw new AppError("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.", 500);
  }
  return fn(instance);
}

export const cloudinaryService = {
  async upload(
    buffer: Buffer,
    mimetype: string,
    folder: CloudinaryFolder = "articles"
  ): Promise<CloudinaryUploadResult> {
    validateFile(buffer, mimetype);

    return withCloudinary(async (instance) => {
      try {
        const result: UploadApiResponse = await instance.uploader.upload(
          `data:${mimetype};base64,${buffer.toString("base64")}`,
          {
            folder: CLOUDINARY_FOLDERS[folder],
            resource_type: "image",
            transformation: [
              { fetch_format: "auto", quality: "auto" },
            ],
          }
        );

        return {
          secure_url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        };
      } catch (error) {
        console.error("Cloudinary upload failed:", error);
        throw new AppError(
          `Image upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          500
        );
      }
    });
  },

  async delete(publicId: string): Promise<void> {
    return withCloudinary(async (instance) => {
      try {
        const result = await instance.uploader.destroy(publicId);
        if (result.result !== "ok" && result.result !== "not found") {
          console.error(`Cloudinary deletion returned: ${result.result} for public_id: ${publicId}`);
        }
      } catch (error) {
        console.error("Cloudinary deletion failed:", error);
        throw new AppError(
          `Image deletion failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          500
        );
      }
    });
  },

  async replace(
    buffer: Buffer,
    mimetype: string,
    oldPublicId: string | null | undefined,
    folder: CloudinaryFolder = "articles"
  ): Promise<CloudinaryUploadResult> {
    if (oldPublicId) {
      await this.delete(oldPublicId);
    }
    return this.upload(buffer, mimetype, folder);
  },
};
