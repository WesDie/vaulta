import sharp from "sharp";
import { encode } from "blurhash";
import * as fs from "fs/promises";
import * as path from "path";

export interface ThumbnailSizes {
  micro: { width: 32; height: 32; quality: 75 }; // For blur hash preview and tiny icons
  small: { width: 250; height: 250; quality: 88 }; // Perfect for 250x250 containers (1x displays)
  medium: { width: 500; height: 500; quality: 92 }; // For 250x250 containers (2x/retina displays)
  large: { width: 800; height: 800; quality: 94 }; // For modal/lightbox view
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

// Helper function to apply EXIF rotation properly
function applyExifRotation(
  image: sharp.Sharp,
  orientation: number
): sharp.Sharp {
  switch (orientation) {
    case 1:
      // No transformation needed
      return image;
    case 2:
      // Horizontal flip
      return image.flop();
    case 3:
      // 180° rotation
      return image.rotate(180);
    case 4:
      // Vertical flip
      return image.flip();
    case 5:
      // 90° rotation + horizontal flip
      return image.rotate(90).flop();
    case 6:
      // 90° clockwise rotation
      return image.rotate(90);
    case 7:
      // 270° rotation + horizontal flip
      return image.rotate(270).flop();
    case 8:
      // 270° clockwise rotation (or 90° counter-clockwise)
      return image.rotate(270);
    default:
      // Unknown orientation, no transformation
      return image;
  }
}

export class ThumbnailService {
  private thumbsPath: string;
  private sizes: ThumbnailSizes = {
    micro: { width: 32, height: 32, quality: 75 },
    small: { width: 250, height: 250, quality: 88 },
    medium: { width: 500, height: 500, quality: 92 },
    large: { width: 800, height: 800, quality: 94 },
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

      // Get image metadata to check orientation
      const metadata = await sharp(originalPath).metadata();

      // Generate blur hash with correct orientation applied
      let blurHashImage = sharp(originalPath);
      if (metadata.orientation) {
        blurHashImage = applyExifRotation(blurHashImage, metadata.orientation);
      }

      const blurHashBuffer = await blurHashImage
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

          // Apply EXIF rotation before resizing
          let thumbnailImage = sharp(originalPath);
          if (metadata.orientation) {
            thumbnailImage = applyExifRotation(
              thumbnailImage,
              metadata.orientation
            );
          }

          await thumbnailImage
            .resize(config.width, config.height, {
              fit: "inside",
              withoutEnlargement: true,
              kernel: "lanczos3", // High-quality resampling kernel
              fastShrinkOnLoad: true, // Performance optimization for large images
            })
            .sharpen(0.5, 1, 2) // Subtle sharpening: sigma, flat, jagged
            .webp({
              quality: config.quality,
              effort: 4, // Good balance of compression vs speed (0-6, 4 is sweet spot)
              smartSubsample: true, // Better quality for photos
              nearLossless: false, // Use lossy for smaller files
              alphaQuality: 90, // High alpha quality for transparency
            })
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

      // Get image metadata to check orientation
      const metadata = await sharp(originalPath).metadata();

      // Apply EXIF rotation before resizing
      let thumbnailImage = sharp(originalPath);
      if (metadata.orientation) {
        thumbnailImage = applyExifRotation(
          thumbnailImage,
          metadata.orientation
        );
      }

      await thumbnailImage
        .resize(config.width, config.height, {
          fit: "inside",
          withoutEnlargement: true,
          kernel: "lanczos3", // High-quality resampling kernel
          fastShrinkOnLoad: true, // Performance optimization for large images
        })
        .sharpen(0.5, 1, 2) // Subtle sharpening: sigma, flat, jagged
        .webp({
          quality: config.quality,
          effort: 4, // Good balance of compression vs speed (0-6, 4 is sweet spot)
          smartSubsample: true, // Better quality for photos
          nearLossless: false, // Use lossy for smaller files
          alphaQuality: 90, // High alpha quality for transparency
        })
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
