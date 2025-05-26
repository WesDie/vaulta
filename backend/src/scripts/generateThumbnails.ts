import { db } from "../config/database";
import { MediaService } from "../services/mediaService";

const mediaService = new MediaService();

async function generateAllThumbnails() {
  try {
    console.log("Starting thumbnail generation for all media files...");

    // Get all media files that don't have thumbnails
    const mediaFiles = await db.query(`
      SELECT id, filename, mime_type 
      FROM media_files 
      WHERE (thumbnail_path IS NULL OR thumbnail_path = '') 
      AND mime_type LIKE 'image/%'
    `);

    console.log(`Found ${mediaFiles.rows.length} images without thumbnails`);

    for (const media of mediaFiles.rows) {
      console.log(`Generating thumbnail for: ${media.filename}`);

      try {
        const thumbnailPath = await mediaService.generateThumbnail(media.id);
        if (thumbnailPath) {
          console.log(`Generated thumbnail: ${thumbnailPath}`);
        } else {
          console.log(`Failed to generate thumbnail for: ${media.filename}`);
        }
      } catch (error) {
        console.error(
          `Error generating thumbnail for ${media.filename}:`,
          error
        );
      }
    }

    console.log("Thumbnail generation complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error during thumbnail generation:", error);
    process.exit(1);
  }
}

generateAllThumbnails();
