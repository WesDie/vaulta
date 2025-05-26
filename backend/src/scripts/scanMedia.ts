import * as fs from "fs/promises";
import * as path from "path";
import { db } from "../config/database";
import { MediaService } from "../services/mediaService";
import sharp from "sharp";

const mediaService = new MediaService();

const SUPPORTED_IMAGE_TYPES = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".bmp",
  ".tiff",
];
const SUPPORTED_VIDEO_TYPES = [".mp4", ".avi", ".mov", ".mkv", ".webm", ".m4v"];
const SUPPORTED_TYPES = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES];

async function getMimeType(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  const mimeTypes: { [key: string]: string } = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".bmp": "image/bmp",
    ".tiff": "image/tiff",
    ".mp4": "video/mp4",
    ".avi": "video/x-msvideo",
    ".mov": "video/quicktime",
    ".mkv": "video/x-matroska",
    ".webm": "video/webm",
    ".m4v": "video/x-m4v",
  };

  return mimeTypes[ext] || "application/octet-stream";
}

async function getImageDimensions(
  filePath: string
): Promise<{ width: number; height: number } | null> {
  try {
    const metadata = await sharp(filePath).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
    };
  } catch (error) {
    console.error(`Failed to get dimensions for ${filePath}:`, error);
    return null;
  }
}

async function scanDirectory(dirPath: string): Promise<void> {
  try {
    const files = await fs.readdir(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        // Recursively scan subdirectories
        await scanDirectory(filePath);
      } else if (stat.isFile()) {
        const ext = path.extname(file).toLowerCase();

        if (SUPPORTED_TYPES.includes(ext)) {
          await processMediaFile(filePath, file, stat);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }
}

async function processMediaFile(
  filePath: string,
  filename: string,
  stat: any
): Promise<void> {
  try {
    // Check if file already exists in database
    const existingFile = await db.query(
      "SELECT id FROM media_files WHERE original_path = $1",
      [filePath]
    );

    if (existingFile.rows.length > 0) {
      console.log(`File already exists in database: ${filename}`);
      return;
    }

    const mimeType = await getMimeType(filePath);
    let dimensions = null;

    // Get dimensions for images
    if (mimeType.startsWith("image/")) {
      dimensions = await getImageDimensions(filePath);
    }

    // Insert into database
    const insertQuery = `
      INSERT INTO media_files (filename, original_path, file_size, mime_type, width, height)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;

    const result = await db.query(insertQuery, [
      filename,
      filePath,
      stat.size,
      mimeType,
      dimensions?.width || null,
      dimensions?.height || null,
    ]);

    const mediaId = result.rows[0].id;

    // Extract EXIF data for images
    if (mimeType.startsWith("image/")) {
      await mediaService.extractExifData(filePath, mediaId);

      // Auto-generate thumbnail for images
      try {
        await mediaService.generateThumbnail(mediaId);
        console.log(`Generated thumbnail for: ${filename}`);
      } catch (error) {
        console.error(`Failed to generate thumbnail for ${filename}:`, error);
      }
    }

    console.log(`Added media file: ${filename} (${mediaId})`);
  } catch (error) {
    console.error(`Error processing file ${filename}:`, error);
  }
}

async function main() {
  const originalsPath =
    process.env.MEDIA_ORIGINALS_PATH ||
    path.join(__dirname, "../../data/originals");

  console.log(`Scanning media files in: ${originalsPath}`);

  try {
    await fs.access(originalsPath);
  } catch (error) {
    console.error(`Originals directory does not exist: ${originalsPath}`);
    process.exit(1);
  }

  await scanDirectory(originalsPath);
  console.log("Media scan completed!");

  // Close database connection
  await db.end();
}

if (require.main === module) {
  main().catch(console.error);
}

export { scanDirectory, processMediaFile };
