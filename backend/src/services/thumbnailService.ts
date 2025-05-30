import sharp from "sharp";
import { encode } from "blurhash";
import * as fs from "fs/promises";
import * as path from "path";

export interface ThumbnailSizes {
  micro: { width: 20; height: 20; quality: 70 }; // For blur hash preview
  small: { width: 200; height: 200; quality: 85 }; // Grid small
  medium: { width: 400; height: 400; quality: 90 }; // Grid medium
  large: { width: 800; height: 800; quality: 95 }; // Grid large & modal preview
}

export interface ThumbnailResult {
  blurHash: string;
  thumbnailPaths: {
    micro?: string;
    small?: string;
    medium?: string;
    large?: string;
  };
}

export class ThumbnailService {
  private thumbsPath: string;
  private sizes: ThumbnailSizes = {
    micro: { width: 20, height: 20, quality: 70 },
    small: { width: 200, height: 200, quality: 85 },
    medium: { width: 400, height: 400, quality: 90 },
    large: { width: 800, height: 800, quality: 95 },
  };

  constructor(
    thumbsPath: string = process.env.MEDIA_THUMBS_PATH || "./data/thumbs"
  ) {
    this.thumbsPath = thumbsPath;
  }

  /**
   * Generate optimized thumbnails and blur hash for an image
   */
  async generateOptimizedThumbnails(
    originalPath: string,
    mediaId: string,
    filename: string
  ): Promise<ThumbnailResult> {
    try {
      // Ensure thumbs directory exists
      await fs.mkdir(this.thumbsPath, { recursive: true });

      const fileExtension = path.extname(filename);
      const baseName = path.basename(filename, fileExtension);

      const result: ThumbnailResult = {
        blurHash: "",
        thumbnailPaths: {},
      };

      // Generate blur hash from a micro-sized image
      const blurHashBuffer = await sharp(originalPath)
        .resize(32, 32, { fit: "inside" })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      result.blurHash = encode(
        new Uint8ClampedArray(blurHashBuffer.data),
        blurHashBuffer.info.width,
        blurHashBuffer.info.height,
        4,
        4
      );

      // Generate multiple thumbnail sizes
      const thumbnailPromises = Object.entries(this.sizes).map(
        async ([size, config]) => {
          const thumbnailName = `${size}_${baseName}_${mediaId}.webp`;
          const thumbnailPath = path.join(this.thumbsPath, thumbnailName);

          await sharp(originalPath)
            .resize(config.width, config.height, {
              fit: "inside",
              withoutEnlargement: true,
            })
            .webp({ quality: config.quality, effort: 6 })
            .toFile(thumbnailPath);

          result.thumbnailPaths[
            size as keyof ThumbnailSizes
          ] = `/thumbs/${thumbnailName}`;
        }
      );

      await Promise.all(thumbnailPromises);

      return result;
    } catch (error) {
      console.error("Error generating optimized thumbnails:", error);
      throw error;
    }
  }

  /**
   * Generate a single thumbnail size (for backward compatibility)
   */
  async generateSingleThumbnail(
    originalPath: string,
    mediaId: string,
    filename: string,
    size: keyof ThumbnailSizes = "large"
  ): Promise<string> {
    try {
      await fs.mkdir(this.thumbsPath, { recursive: true });

      const fileExtension = path.extname(filename);
      const baseName = path.basename(filename, fileExtension);
      const config = this.sizes[size];

      const thumbnailName = `${size}_${baseName}_${mediaId}.webp`;
      const thumbnailPath = path.join(this.thumbsPath, thumbnailName);

      await sharp(originalPath)
        .resize(config.width, config.height, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: config.quality, effort: 6 })
        .toFile(thumbnailPath);

      return `/thumbs/${thumbnailName}`;
    } catch (error) {
      console.error("Error generating single thumbnail:", error);
      throw error;
    }
  }

  /**
   * Check if thumbnails exist for a media file
   */
  async thumbnailsExist(mediaId: string, filename: string): Promise<boolean> {
    try {
      const fileExtension = path.extname(filename);
      const baseName = path.basename(filename, fileExtension);

      // Check if at least the large thumbnail exists
      const largeThumbnailName = `large_${baseName}_${mediaId}.webp`;
      const largeThumbnailPath = path.join(this.thumbsPath, largeThumbnailName);

      await fs.access(largeThumbnailPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the path for a specific thumbnail size
   */
  getThumbnailPath(
    mediaId: string,
    filename: string,
    size: keyof ThumbnailSizes
  ): string {
    const fileExtension = path.extname(filename);
    const baseName = path.basename(filename, fileExtension);
    const thumbnailName = `${size}_${baseName}_${mediaId}.webp`;
    return `/thumbs/${thumbnailName}`;
  }

  /**
   * Delete all thumbnails for a media file
   */
  async deleteThumbnails(mediaId: string, filename: string): Promise<void> {
    try {
      const fileExtension = path.extname(filename);
      const baseName = path.basename(filename, fileExtension);

      const deletePromises = Object.keys(this.sizes).map(async (size) => {
        const thumbnailName = `${size}_${baseName}_${mediaId}.webp`;
        const thumbnailPath = path.join(this.thumbsPath, thumbnailName);

        try {
          await fs.unlink(thumbnailPath);
        } catch {
          // Ignore if file doesn't exist
        }
      });

      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Error deleting thumbnails:", error);
    }
  }
}
