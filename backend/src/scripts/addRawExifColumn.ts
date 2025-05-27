import { db } from "../config/database";

async function addRawExifColumn() {
  try {
    console.log("Adding raw_exif_data column to exif_data table...");

    // Check if column already exists
    const columnExists = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'exif_data' 
      AND column_name = 'raw_exif_data'
    `);

    if (columnExists.rows.length > 0) {
      console.log("Column raw_exif_data already exists, skipping...");
      return;
    }

    // Add the column
    await db.query(`
      ALTER TABLE exif_data 
      ADD COLUMN raw_exif_data JSONB
    `);

    // Add unique constraint on media_file_id if it doesn't exist
    const constraintExists = await db.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'exif_data' 
      AND constraint_type = 'UNIQUE'
      AND constraint_name LIKE '%media_file_id%'
    `);

    if (constraintExists.rows.length === 0) {
      await db.query(`
        ALTER TABLE exif_data 
        ADD CONSTRAINT exif_data_media_file_id_unique 
        UNIQUE (media_file_id)
      `);
      console.log("Added unique constraint on media_file_id");
    }

    console.log("Successfully added raw_exif_data column");

    // Optionally re-extract EXIF data for existing images
    console.log("Re-extracting EXIF data for existing images...");
    const { MediaService } = await import("../services/mediaService");
    const mediaService = new MediaService();

    const existingImages = await db.query(`
      SELECT m.id, m.original_path, m.mime_type 
      FROM media_files m 
      WHERE m.mime_type LIKE 'image/%'
    `);

    let processed = 0;
    for (const image of existingImages.rows) {
      try {
        await mediaService.extractExifData(image.original_path, image.id);
        processed++;
        if (processed % 10 === 0) {
          console.log(
            `Processed ${processed}/${existingImages.rows.length} images`
          );
        }
      } catch (error) {
        console.error(
          `Failed to re-extract EXIF for ${image.original_path}:`,
          error
        );
      }
    }

    console.log(`Completed re-extraction for ${processed} images`);
  } catch (error) {
    console.error("Error adding raw_exif_data column:", error);
    throw error;
  } finally {
    await db.end();
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  addRawExifColumn()
    .then(() => {
      console.log("Migration completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

export { addRawExifColumn };
