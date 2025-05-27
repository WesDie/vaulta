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
      limit = 20,
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

    // Get media files with pagination
    const dataQuery = `
      SELECT DISTINCT m.*, e.camera, e.lens, e.date_taken
      FROM media_files m
      LEFT JOIN exif_data e ON m.id = e.media_file_id
      ${whereClause}
      ${orderClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);

    const result = await db.query(dataQuery, queryParams);

    // Get tags and collections for each media file
    const mediaFiles: MediaFile[] = [];
    for (const row of result.rows) {
      const mediaFile = await this.enrichMediaFile(row);
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
             e.iso, e.date_taken, e.gps_latitude, e.gps_longitude
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
          .resize(400, 400, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: 85 })
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
      const exifData = await exifr.parse(filePath);
      if (!exifData) return;

      const insertQuery = `
        INSERT INTO exif_data (
          media_file_id, camera, lens, focal_length, aperture, 
          shutter_speed, iso, date_taken, gps_latitude, gps_longitude
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (media_file_id) DO UPDATE SET
          camera = EXCLUDED.camera,
          lens = EXCLUDED.lens,
          focal_length = EXCLUDED.focal_length,
          aperture = EXCLUDED.aperture,
          shutter_speed = EXCLUDED.shutter_speed,
          iso = EXCLUDED.iso,
          date_taken = EXCLUDED.date_taken,
          gps_latitude = EXCLUDED.gps_latitude,
          gps_longitude = EXCLUDED.gps_longitude
      `;

      await db.query(insertQuery, [
        mediaId,
        exifData.Make ? `${exifData.Make} ${exifData.Model}`.trim() : null,
        exifData.LensModel || null,
        exifData.FocalLength || null,
        exifData.FNumber || null,
        exifData.ExposureTime
          ? `1/${Math.round(1 / exifData.ExposureTime)}`
          : null,
        exifData.ISO || null,
        exifData.DateTimeOriginal || exifData.DateTime || null,
        exifData.latitude || null,
        exifData.longitude || null,
      ]);
    } catch (error) {
      console.error("Error extracting EXIF data:", error);
    }
  }

  async uploadMediaFile(fileData: any): Promise<MediaFile> {
    const buffer = await fileData.toBuffer();
    const filename = fileData.filename;
    const originalPath = path.join(this.originalsPath, filename);

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
      await this.extractExifData(originalPath, mediaId);

      // Auto-generate thumbnail
      try {
        await this.generateThumbnail(mediaId);
      } catch (error) {
        console.error(
          `Failed to generate thumbnail for uploaded file ${filename}:`,
          error
        );
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

    const exifData: ExifData | undefined = row.camera
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
}
