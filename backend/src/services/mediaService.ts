import { db } from "../config/database";
import { MediaFile, MediaQuery, PaginatedResponse, ExifData } from "../types";
import sharp from "sharp";
import * as exifr from "exifr";
import * as fs from "fs/promises";
import * as path from "path";

export class MediaService {
  private originalsPath =
    process.env.MEDIA_ORIGINALS_PATH || "./data/originals";
  private thumbsPath = process.env.MEDIA_THUMBS_PATH || "./data/thumbs";

  async getMediaFiles(
    query: MediaQuery
  ): Promise<PaginatedResponse<MediaFile>> {
    const {
      page = 1,
      limit = 200,
      tags,
      collections,
      mimeType,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    // Build WHERE conditions
    if (mimeType) {
      whereConditions.push(`m.mime_type LIKE $${paramIndex}`);
      queryParams.push(`${mimeType}%`);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`m.filename ILIKE $${paramIndex}`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (tags && tags.length > 0) {
      whereConditions.push(`m.id IN (
        SELECT mt.media_file_id FROM media_tags mt 
        JOIN tags t ON mt.tag_id = t.id 
        WHERE t.name = ANY($${paramIndex})
      )`);
      queryParams.push(tags);
      paramIndex++;
    }

    if (collections && collections.length > 0) {
      whereConditions.push(`m.id IN (
        SELECT mc.media_file_id FROM media_collections mc 
        JOIN collections c ON mc.collection_id = c.id 
        WHERE c.name = ANY($${paramIndex})
      )`);
      queryParams.push(collections);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Map camelCase field names to database column names
    const sortFieldMap: { [key: string]: string } = {
      createdAt: "created_at",
      updatedAt: "updated_at",
      fileName: "filename",
      fileSize: "file_size",
      mimeType: "mime_type",
    };
    const dbSortField = sortFieldMap[sortBy] || sortBy;
    const orderClause = `ORDER BY m.${dbSortField} ${sortOrder.toUpperCase()}`;

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT m.id) as total
      FROM media_files m
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Optimized query - only get essential fields for gallery view
    // EXIF data is loaded separately when needed (in modal)
    const dataQuery = `
      SELECT m.id, m.filename, m.original_path, m.thumbnail_path, 
             m.file_size, m.mime_type, m.width, m.height, 
             m.created_at, m.updated_at
      FROM media_files m
      ${whereClause}
      ${orderClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);

    const result = await db.query(dataQuery, queryParams);

    // Lightweight enrichment - only get tags count for gallery view
    const mediaFiles: MediaFile[] = [];
    for (const row of result.rows) {
      const mediaFile = await this.enrichMediaFileLight(row);
      mediaFiles.push(mediaFile);
    }

    return {
      data: mediaFiles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMediaFileById(id: string): Promise<MediaFile | null> {
    const query = `
      SELECT m.id, m.filename, m.original_path, m.thumbnail_path, m.file_size, 
             m.mime_type, m.width, m.height, m.created_at, m.updated_at,
             e.camera, e.lens, e.focal_length, e.aperture, e.shutter_speed, 
             e.iso, e.date_taken, e.gps_latitude, e.gps_longitude, e.raw_exif_data
      FROM media_files m
      LEFT JOIN exif_data e ON m.id = e.media_file_id
      WHERE m.id = $1
    `;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return await this.enrichMediaFile(result.rows[0]);
  }

  async generateThumbnail(mediaId: string): Promise<string | null> {
    const mediaFile = await this.getMediaFileById(mediaId);
    if (!mediaFile) return null;

    // Use the original path directly instead of joining with filename
    const originalPath = mediaFile.originalPath;
    const fileExtension = path.extname(mediaFile.filename);
    const baseName = path.basename(mediaFile.filename, fileExtension);
    const thumbnailName = `thumb_${baseName}_${mediaFile.id}.jpg`;
    const thumbnailPath = path.join(this.thumbsPath, thumbnailName);

    try {
      // Check if thumbnail already exists
      try {
        await fs.access(thumbnailPath);
        // Make sure it's also recorded in the database
        await db.query(
          "UPDATE media_files SET thumbnail_path = $1 WHERE id = $2",
          [`/thumbs/${thumbnailName}`, mediaId]
        );
        return `/thumbs/${thumbnailName}`;
      } catch {
        // Thumbnail doesn't exist, create it
      }

      // Ensure thumbs directory exists
      await fs.mkdir(this.thumbsPath, { recursive: true });

      if (mediaFile.mimeType.startsWith("image/")) {
        await sharp(originalPath)
          .resize(800, 800, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: 92 })
          .toFile(thumbnailPath);

        // Update database with thumbnail path
        await db.query(
          "UPDATE media_files SET thumbnail_path = $1 WHERE id = $2",
          [`/thumbs/${thumbnailName}`, mediaId]
        );

        return `/thumbs/${thumbnailName}`;
      }

      return null;
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      return null;
    }
  }

  async extractExifData(filePath: string, mediaId: string): Promise<void> {
    try {
      console.log(`Extracting EXIF data from: ${filePath}`);

      // Ensure we have the correct absolute path
      let resolvedPath = filePath;
      if (!path.isAbsolute(filePath)) {
        // If the path is relative, resolve it relative to the originals directory
        resolvedPath = path.resolve(
          this.originalsPath,
          path.basename(filePath)
        );
        console.log(`Resolved relative path to: ${resolvedPath}`);
      }

      // Check if file exists
      try {
        await fs.access(resolvedPath);
        console.log(`File exists at: ${resolvedPath}`);
      } catch (error) {
        console.error(`File not found at: ${resolvedPath}`);
        throw new Error(`File not found: ${resolvedPath}`);
      }

      // Extract all available EXIF data
      const exifData = await exifr.parse(resolvedPath, {
        translateKeys: false, // Keep original tag names
        translateValues: false, // Keep original values
        mergeOutput: false, // Keep separate IFD sections
      });

      console.log(
        `EXIF data extracted:`,
        exifData ? Object.keys(exifData) : "No EXIF data found"
      );

      if (!exifData) {
        console.log(`No EXIF data found for ${resolvedPath}`);
        return;
      }

      // Clean and prepare raw EXIF data for JSON storage
      const cleanExifData = this.cleanExifDataForJson(exifData);

      // Extract structured fields from the nested EXIF data
      const camera = (() => {
        const make =
          exifData.Make || exifData.ifd0?.["271"] || exifData.ifd0?.Make;
        const model =
          exifData.Model || exifData.ifd0?.["272"] || exifData.ifd0?.Model;
        if (make && model) {
          return `${make} ${model}`.trim();
        }
        return make || model || null;
      })();

      const lens =
        exifData.LensModel ||
        exifData.exif?.["42036"] ||
        exifData.exif?.LensModel ||
        null;

      const focalLength =
        exifData.FocalLength ||
        exifData.exif?.["37386"] ||
        exifData.exif?.FocalLength ||
        null;

      const aperture =
        exifData.FNumber ||
        exifData.exif?.["33437"] ||
        exifData.exif?.FNumber ||
        null;

      const shutterSpeed = (() => {
        const exposureTime =
          exifData.ExposureTime ||
          exifData.exif?.["33434"] ||
          exifData.exif?.ExposureTime;
        if (exposureTime && exposureTime > 0) {
          return `1/${Math.round(1 / exposureTime)}`;
        }
        return null;
      })();

      const iso =
        exifData.ISO || exifData.exif?.["34855"] || exifData.exif?.ISO || null;

      const dateTaken = (() => {
        const dateTimeOriginal =
          exifData.DateTimeOriginal ||
          exifData.exif?.["36867"] ||
          exifData.exif?.DateTimeOriginal;
        const dateTime =
          exifData.DateTime ||
          exifData.ifd0?.["306"] ||
          exifData.ifd0?.DateTime;
        return dateTimeOriginal || dateTime || null;
      })();

      const latitude = exifData.latitude || exifData.gps?.latitude || null;

      const longitude = exifData.longitude || exifData.gps?.longitude || null;

      console.log(`Parsed EXIF values:`, {
        camera,
        lens,
        focalLength,
        aperture,
        shutterSpeed,
        iso,
        dateTaken,
        latitude,
        longitude,
        hasRawData: !!cleanExifData,
      });

      // Debug the cleanExifData before stringifying
      console.log(
        `About to stringify cleanExifData:`,
        typeof cleanExifData,
        Object.keys(cleanExifData || {})
      );

      let rawExifDataString;
      try {
        rawExifDataString = JSON.stringify(cleanExifData);
        console.log(
          `Successfully stringified EXIF data, length: ${rawExifDataString.length}`
        );
      } catch (stringifyError) {
        console.error(`Failed to stringify cleanExifData:`, stringifyError);
        rawExifDataString = JSON.stringify({
          error: "Failed to serialize EXIF data",
          message:
            stringifyError instanceof Error
              ? stringifyError.message
              : "Unknown error",
        });
      }

      const insertQuery = `
        INSERT INTO exif_data (
          media_file_id, camera, lens, focal_length, aperture, 
          shutter_speed, iso, date_taken, gps_latitude, gps_longitude, raw_exif_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (media_file_id) DO UPDATE SET
          camera = EXCLUDED.camera,
          lens = EXCLUDED.lens,
          focal_length = EXCLUDED.focal_length,
          aperture = EXCLUDED.aperture,
          shutter_speed = EXCLUDED.shutter_speed,
          iso = EXCLUDED.iso,
          date_taken = EXCLUDED.date_taken,
          gps_latitude = EXCLUDED.gps_latitude,
          gps_longitude = EXCLUDED.gps_longitude,
          raw_exif_data = EXCLUDED.raw_exif_data
      `;

      await db.query(insertQuery, [
        mediaId,
        camera,
        lens,
        focalLength,
        aperture,
        shutterSpeed,
        iso,
        dateTaken,
        latitude,
        longitude,
        rawExifDataString, // Use the safely stringified data
      ]);

      console.log(`EXIF data successfully stored for media ID: ${mediaId}`);
    } catch (error) {
      console.error("Error extracting EXIF data:", error);
      throw error; // Re-throw to let the caller handle it
    }
  }

  private cleanExifDataForJson(exifData: any): Record<string, any> {
    const cleaned: Record<string, any> = {};

    const cleanValue = (value: any, keyPath: string = ""): any => {
      try {
        if (value === null || value === undefined) {
          return null;
        }

        // Handle Buffer objects (convert to base64 or description)
        if (Buffer.isBuffer(value)) {
          // For small buffers, convert to base64, for large ones just note their presence
          if (value.length < 1024) {
            return {
              type: "buffer",
              data: value.toString("base64"),
              length: value.length,
            };
          } else {
            return {
              type: "buffer",
              length: value.length,
              description: "Binary data (too large to store)",
            };
          }
        }

        // Handle Date objects
        if (value instanceof Date) {
          return value.toISOString();
        }

        // Handle strings - remove null bytes and other problematic characters
        if (typeof value === "string") {
          // Remove null bytes and other control characters that cause JSON issues
          return value
            .replace(/\u0000/g, "") // Remove null bytes
            .replace(/[\u0001-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "") // Remove other control characters
            .replace(/\\/g, "\\\\") // Escape backslashes
            .trim();
        }

        // Handle arrays
        if (Array.isArray(value)) {
          return value.map((item, index) =>
            cleanValue(item, `${keyPath}[${index}]`)
          );
        }

        // Handle objects recursively
        if (typeof value === "object" && value !== null) {
          // Check for circular references or problematic objects
          if (
            value.constructor &&
            value.constructor.name &&
            !["Object", "Array"].includes(value.constructor.name)
          ) {
            console.log(
              `Converting non-plain object at ${keyPath}:`,
              value.constructor.name
            );
            // Try to convert to plain object
            try {
              const plainObj = JSON.parse(JSON.stringify(value));
              const cleanedPlainObj: Record<string, any> = {};
              for (const [key, val] of Object.entries(plainObj)) {
                cleanedPlainObj[key] = cleanValue(val, `${keyPath}.${key}`);
              }
              return cleanedPlainObj;
            } catch (e) {
              console.warn(
                `Failed to serialize object at ${keyPath}, converting to string:`,
                e instanceof Error ? e.message : String(e)
              );
              // Clean the string representation too
              const stringRep = `[${value.constructor.name}: ${String(value)}]`;
              return stringRep
                .replace(/\u0000/g, "")
                .replace(/[\u0001-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
                .replace(/\\/g, "\\\\");
            }
          }

          const cleanedObj: Record<string, any> = {};
          for (const [key, val] of Object.entries(value)) {
            try {
              // Clean the key as well
              const cleanKey = String(key)
                .replace(/\u0000/g, "")
                .replace(/[\u0001-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
                .replace(/\\/g, "\\\\");
              cleanedObj[cleanKey] = cleanValue(val, `${keyPath}.${key}`);
            } catch (error) {
              console.warn(
                `Failed to clean value at ${keyPath}.${key}:`,
                error
              );
              cleanedObj[String(key)] = `[Error: ${
                error instanceof Error ? error.message : "Unknown error"
              }]`;
            }
          }
          return cleanedObj;
        }

        // Handle functions (convert to string representation)
        if (typeof value === "function") {
          return `[Function: ${value.name || "anonymous"}]`;
        }

        // Handle symbols
        if (typeof value === "symbol") {
          return value.toString();
        }

        // Handle bigint
        if (typeof value === "bigint") {
          return value.toString();
        }

        // Return primitive values as-is (numbers, booleans)
        return value;
      } catch (error) {
        console.warn(`Error cleaning value at ${keyPath}:`, error);
        return `[Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }]`;
      }
    };

    try {
      for (const [key, value] of Object.entries(exifData)) {
        try {
          // Clean the key as well
          const cleanKey = String(key)
            .replace(/\u0000/g, "")
            .replace(/[\u0001-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
            .replace(/\\/g, "\\\\");
          cleaned[cleanKey] = cleanValue(value, key);
        } catch (error) {
          console.warn(`Failed to clean EXIF key ${key}:`, error);
          cleaned[String(key)] = `[Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }]`;
        }
      }

      // Test if the cleaned data can be JSON stringified and is safe for PostgreSQL
      const testString = JSON.stringify(cleaned);

      // Additional check for any remaining problematic characters
      if (
        testString.includes("\u0000") ||
        /[\u0001-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(testString)
      ) {
        console.warn(
          "Cleaned EXIF data still contains problematic characters, applying final sanitization"
        );
        const sanitizedString = testString
          .replace(/\u0000/g, "")
          .replace(/[\u0001-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
        return JSON.parse(sanitizedString);
      }

      console.log(
        `Successfully cleaned EXIF data with keys:`,
        Object.keys(cleaned)
      );

      return cleaned;
    } catch (error) {
      console.error("Failed to clean EXIF data for JSON:", error);
      // Return a safe fallback
      return {
        error: "Failed to process EXIF data",
        originalKeys: Object.keys(exifData || {}),
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async uploadMediaFile(fileData: any): Promise<MediaFile> {
    const filename = fileData.filename;

    // Validate file type
    if (!this.isValidMediaFile(filename)) {
      throw new Error(
        `Unsupported file type: ${path.extname(
          filename
        )}. Only images and videos are supported.`
      );
    }

    const buffer = await fileData.toBuffer();
    const originalPath = path.join(this.originalsPath, filename);

    // Check if file already exists
    const existingFile = await db.query(
      "SELECT id FROM media_files WHERE filename = $1",
      [filename]
    );

    if (existingFile.rows.length > 0) {
      throw new Error(`File '${filename}' already exists in the database.`);
    }

    // Ensure originals directory exists
    await fs.mkdir(this.originalsPath, { recursive: true });

    // Save file to disk
    await fs.writeFile(originalPath, buffer);

    // Get file stats
    const stats = await fs.stat(originalPath);
    const mimeType = this.getMimeType(filename);

    let dimensions = null;
    if (mimeType.startsWith("image/")) {
      try {
        const metadata = await sharp(originalPath).metadata();
        dimensions = {
          width: metadata.width || 0,
          height: metadata.height || 0,
        };
      } catch (error) {
        console.error("Failed to get image dimensions:", error);
      }
    }

    // Insert into database
    const insertQuery = `
      INSERT INTO media_files (filename, original_path, file_size, mime_type, width, height)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;

    const result = await db.query(insertQuery, [
      filename,
      originalPath,
      stats.size,
      mimeType,
      dimensions?.width || null,
      dimensions?.height || null,
    ]);

    const mediaId = result.rows[0].id;

    // Extract EXIF data for images and generate thumbnail
    if (mimeType.startsWith("image/")) {
      try {
        await this.extractExifData(originalPath, mediaId);
      } catch (error) {
        console.error(
          `Failed to extract EXIF data for uploaded file ${filename}:`,
          error
        );
        // Don't throw the error - file upload should still succeed
      }

      // Auto-generate thumbnail
      try {
        await this.generateThumbnail(mediaId);
      } catch (error) {
        console.error(
          `Failed to generate thumbnail for uploaded file ${filename}:`,
          error
        );
        // Don't throw the error - file upload should still succeed
      }
    }

    return (await this.getMediaFileById(mediaId)) as MediaFile;
  }

  async deleteMediaFile(id: string): Promise<boolean> {
    const mediaFile = await this.getMediaFileById(id);
    if (!mediaFile) {
      return false;
    }

    try {
      // Start a transaction
      await db.query("BEGIN");

      // Delete from related tables first (due to foreign key constraints)
      await db.query("DELETE FROM media_tags WHERE media_file_id = $1", [id]);
      await db.query("DELETE FROM media_collections WHERE media_file_id = $1", [
        id,
      ]);
      await db.query("DELETE FROM exif_data WHERE media_file_id = $1", [id]);

      // Delete the main record
      await db.query("DELETE FROM media_files WHERE id = $1", [id]);

      // Delete physical files
      try {
        // Delete original file
        await fs.unlink(mediaFile.originalPath);
      } catch (error) {
        console.warn(
          `Failed to delete original file: ${mediaFile.originalPath}`,
          error
        );
      }

      // Delete thumbnail file if it exists
      if (mediaFile.thumbnailPath) {
        try {
          const thumbnailFilename = mediaFile.thumbnailPath.replace(
            "/thumbs/",
            ""
          );
          const fullThumbnailPath = path.join(
            this.thumbsPath,
            thumbnailFilename
          );
          await fs.unlink(fullThumbnailPath);
        } catch (error) {
          console.warn(
            `Failed to delete thumbnail file: ${mediaFile.thumbnailPath}`,
            error
          );
        }
      }

      // Commit the transaction
      await db.query("COMMIT");
      return true;
    } catch (error) {
      // Rollback on error
      await db.query("ROLLBACK");
      console.error("Error deleting media file:", error);
      return false;
    }
  }

  async deleteMediaFiles(ids: string[]): Promise<{
    success: string[];
    failed: Array<{ id: string; error: string }>;
  }> {
    const result = {
      success: [] as string[],
      failed: [] as Array<{ id: string; error: string }>,
    };

    if (ids.length === 0) {
      return result;
    }

    // Get all media files first to validate they exist and get file paths
    const mediaFiles = new Map<string, MediaFile>();
    for (const id of ids) {
      try {
        const mediaFile = await this.getMediaFileById(id);
        if (mediaFile) {
          mediaFiles.set(id, mediaFile);
        } else {
          result.failed.push({ id, error: "Media file not found" });
        }
      } catch (error) {
        result.failed.push({
          id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const validIds = Array.from(mediaFiles.keys());
    if (validIds.length === 0) {
      return result;
    }

    try {
      // Start a transaction for database operations
      await db.query("BEGIN");

      // Delete from related tables first (due to foreign key constraints)
      const placeholders = validIds
        .map((_, index) => `$${index + 1}`)
        .join(",");

      await db.query(
        `DELETE FROM media_tags WHERE media_file_id IN (${placeholders})`,
        validIds
      );

      await db.query(
        `DELETE FROM media_collections WHERE media_file_id IN (${placeholders})`,
        validIds
      );

      await db.query(
        `DELETE FROM exif_data WHERE media_file_id IN (${placeholders})`,
        validIds
      );

      // Delete the main records
      await db.query(
        `DELETE FROM media_files WHERE id IN (${placeholders})`,
        validIds
      );

      // Commit the transaction
      await db.query("COMMIT");

      // Now delete physical files (outside transaction)
      for (const id of validIds) {
        const mediaFile = mediaFiles.get(id)!;

        try {
          // Delete original file
          await fs.unlink(mediaFile.originalPath);
        } catch (error) {
          console.warn(
            `Failed to delete original file: ${mediaFile.originalPath}`,
            error
          );
        }

        // Delete thumbnail file if it exists
        if (mediaFile.thumbnailPath) {
          try {
            const thumbnailFilename = mediaFile.thumbnailPath.replace(
              "/thumbs/",
              ""
            );
            const fullThumbnailPath = path.join(
              this.thumbsPath,
              thumbnailFilename
            );
            await fs.unlink(fullThumbnailPath);
          } catch (error) {
            console.warn(
              `Failed to delete thumbnail file: ${mediaFile.thumbnailPath}`,
              error
            );
          }
        }

        result.success.push(id);
      }
    } catch (error) {
      // Rollback on error
      await db.query("ROLLBACK");
      console.error("Error in bulk delete transaction:", error);

      // Add all valid IDs to failed list
      for (const id of validIds) {
        result.failed.push({
          id,
          error:
            error instanceof Error
              ? error.message
              : "Database transaction failed",
        });
      }
    }

    return result;
  }

  async scanMediaDirectory(): Promise<{ scanned: number; added: number }> {
    const { scanDirectory } = await import("../scripts/scanMedia");

    let scanned = 0;
    let added = 0;

    // This is a simplified version - in a real implementation you'd want better tracking
    const files = await this.scanDirectoryRecursive(this.originalsPath);
    scanned = files.length;

    // For now, just return the count of existing files
    const existingCount = await db.query(
      "SELECT COUNT(*) as count FROM media_files"
    );
    const currentCount = parseInt(existingCount.rows[0].count);

    await scanDirectory(this.originalsPath);

    const newCount = await db.query(
      "SELECT COUNT(*) as count FROM media_files"
    );
    added = parseInt(newCount.rows[0].count) - currentCount;

    return { scanned, added };
  }

  private async scanDirectoryRecursive(dirPath: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dirPath);

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry);
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
          const subFiles = await this.scanDirectoryRecursive(fullPath);
          files.push(...subFiles);
        } else if (stat.isFile()) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error);
    }

    return files;
  }

  private getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();

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

  private isValidMediaFile(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    const supportedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".bmp",
      ".tiff", // Images
      ".mp4",
      ".avi",
      ".mov",
      ".mkv",
      ".webm",
      ".m4v", // Videos
    ];
    return supportedExtensions.includes(ext);
  }

  private getFileType(filename: string): "image" | "video" | "unknown" {
    const ext = path.extname(filename).toLowerCase();
    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".bmp",
      ".tiff",
    ];
    const videoExtensions = [".mp4", ".avi", ".mov", ".mkv", ".webm", ".m4v"];

    if (imageExtensions.includes(ext)) return "image";
    if (videoExtensions.includes(ext)) return "video";
    return "unknown";
  }

  private async enrichMediaFile(row: any): Promise<MediaFile> {
    // Get tags
    const tagsQuery = `
      SELECT t.id, t.name, t.color
      FROM tags t
      JOIN media_tags mt ON t.id = mt.tag_id
      WHERE mt.media_file_id = $1
    `;
    const tagsResult = await db.query(tagsQuery, [row.id]);

    // Get collections
    const collectionsQuery = `
      SELECT c.id, c.name, c.description
      FROM collections c
      JOIN media_collections mc ON c.id = mc.collection_id
      WHERE mc.media_file_id = $1
    `;
    const collectionsResult = await db.query(collectionsQuery, [row.id]);

    const exifData: ExifData | undefined =
      row.camera ||
      row.lens ||
      row.focal_length ||
      row.aperture ||
      row.shutter_speed ||
      row.iso ||
      row.date_taken ||
      row.gps_latitude ||
      row.gps_longitude ||
      row.raw_exif_data
        ? {
            camera: row.camera,
            lens: row.lens,
            focalLength: row.focal_length,
            aperture: row.aperture,
            shutterSpeed: row.shutter_speed,
            iso: row.iso,
            dateTaken: row.date_taken,
            gps:
              row.gps_latitude && row.gps_longitude
                ? {
                    latitude: parseFloat(row.gps_latitude),
                    longitude: parseFloat(row.gps_longitude),
                  }
                : undefined,
            rawExifData: row.raw_exif_data
              ? (() => {
                  try {
                    // If it's already an object, return it directly
                    if (typeof row.raw_exif_data === "object") {
                      return row.raw_exif_data;
                    }
                    // If it's a string, try to parse it
                    return JSON.parse(row.raw_exif_data);
                  } catch (error) {
                    console.error(
                      `Failed to parse raw_exif_data for media ${row.id}:`,
                      error
                    );
                    return { error: "Invalid EXIF data format" };
                  }
                })()
              : undefined,
          }
        : undefined;

    return {
      id: row.id,
      filename: row.filename,
      originalPath: row.original_path,
      thumbnailPath: row.thumbnail_path,
      fileSize: parseInt(row.file_size),
      mimeType: row.mime_type,
      width: row.width,
      height: row.height,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      exifData,
      tags: tagsResult.rows,
      collections: collectionsResult.rows,
    };
  }

  // Lightweight version for gallery view - only loads essential data
  private async enrichMediaFileLight(row: any): Promise<MediaFile> {
    // Get tags count only (not full tag data)
    const tagsQuery = `
      SELECT COUNT(*) as tag_count
      FROM media_tags mt
      WHERE mt.media_file_id = $1
    `;
    const tagsResult = await db.query(tagsQuery, [row.id]);
    const tagCount = parseInt(tagsResult.rows[0].tag_count || 0);

    // Create minimal tags array for display
    const tags =
      tagCount > 0
        ? Array(tagCount).fill({ id: "", name: "tag", color: "" })
        : [];

    return {
      id: row.id,
      filename: row.filename,
      originalPath: row.original_path,
      thumbnailPath: row.thumbnail_path,
      fileSize: parseInt(row.file_size),
      mimeType: row.mime_type,
      width: row.width,
      height: row.height,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      tags, // Simplified tags for gallery view
      collections: [], // Empty for gallery view
      // No EXIF data for gallery view - loaded separately when needed
    };
  }
}
