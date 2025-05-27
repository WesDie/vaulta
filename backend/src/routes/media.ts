import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { MediaService } from "../services/mediaService";
import { MediaQuery } from "../types";
import * as path from "path";
import * as fs from "fs/promises";

const mediaService = new MediaService();

export async function mediaRoutes(fastify: FastifyInstance) {
  // Get all media files with filtering and pagination
  fastify.get(
    "/media",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const query = request.query as MediaQuery;
        const result = await mediaService.getMediaFiles(query);

        reply.send({
          success: true,
          data: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          error: "Failed to fetch media files",
        });
      }
    }
  );

  // Get specific media file by ID
  fastify.get(
    "/media/:id",
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;
        const mediaFile = await mediaService.getMediaFileById(id);

        if (!mediaFile) {
          reply.status(404).send({
            success: false,
            error: "Media file not found",
          });
          return;
        }

        reply.send({
          success: true,
          data: mediaFile,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          error: "Failed to fetch media file",
        });
      }
    }
  );

  // Generate thumbnail for media file
  fastify.post(
    "/media/:id/thumbnail",
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;
        const thumbnailPath = await mediaService.generateThumbnail(id);

        if (!thumbnailPath) {
          reply.status(404).send({
            success: false,
            error: "Failed to generate thumbnail",
          });
          return;
        }

        // Get the updated media file with the new thumbnail path
        const updatedMediaFile = await mediaService.getMediaFileById(id);

        reply.send({
          success: true,
          data: {
            thumbnailPath,
            mediaFile: updatedMediaFile,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          error: "Failed to generate thumbnail",
        });
      }
    }
  );

  // Serve optimized image (thumbnail if available, otherwise generate on-the-fly)
  fastify.get(
    "/media/:id/image",
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Querystring: { size?: string };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;
        const { size = "thumb" } = request.query;

        const mediaFile = await mediaService.getMediaFileById(id);
        if (!mediaFile || !mediaFile.mimeType.startsWith("image/")) {
          reply.status(404).send("Image not found");
          return;
        }

        // For thumb size, try to serve thumbnail or generate it
        if (size === "thumb") {
          // Try to generate thumbnail if it doesn't exist
          if (!mediaFile.thumbnailPath) {
            await mediaService.generateThumbnail(id);
            const updatedMedia = await mediaService.getMediaFileById(id);
            if (updatedMedia?.thumbnailPath) {
              mediaFile.thumbnailPath = updatedMedia.thumbnailPath;
            }
          }

          // If we have a thumbnail path, try to serve it
          if (mediaFile.thumbnailPath) {
            const thumbnailFilename = mediaFile.thumbnailPath.replace(
              "/thumbs/",
              ""
            );
            const thumbsDir = process.env.MEDIA_THUMBS_PATH || "./data/thumbs";
            const fullThumbnailPath = path.resolve(
              thumbsDir,
              thumbnailFilename
            );

            try {
              await fs.access(fullThumbnailPath);
              const fileStream = await fs.readFile(fullThumbnailPath);

              reply.header("Content-Type", "image/jpeg");
              reply.header("Cache-Control", "public, max-age=31536000");
              return reply.send(fileStream);
            } catch (error) {
              fastify.log.warn(
                `Thumbnail file not accessible: ${fullThumbnailPath}`,
                error
              );
            }
          }
        }

        // For full size or if thumbnail fallback, serve original file
        try {
          const originalPath = path.resolve(mediaFile.originalPath);
          const fileStream = await fs.readFile(originalPath);

          reply.header("Content-Type", mediaFile.mimeType);
          reply.header("Cache-Control", "public, max-age=3600");
          return reply.send(fileStream);
        } catch (error) {
          fastify.log.error(
            `Failed to read original file: ${mediaFile.originalPath}`,
            error
          );
          reply.status(404).send("File not found");
        }
      } catch (error) {
        fastify.log.error("Error serving optimized image:", error);
        reply.status(500).send("Internal server error");
      }
    }
  );

  // Add tags to media file
  fastify.post(
    "/media/:id/tags",
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: { tagIds: string[] };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;
        const { tagIds } = request.body;

        // TODO: Implement adding tags to media file
        // This would involve inserting records into media_tags table

        reply.send({
          success: true,
          message: "Tags added successfully",
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          error: "Failed to add tags",
        });
      }
    }
  );

  // Remove tags from media file
  fastify.delete(
    "/media/:id/tags",
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: { tagIds: string[] };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;
        const { tagIds } = request.body;

        // TODO: Implement removing tags from media file

        reply.send({
          success: true,
          message: "Tags removed successfully",
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          error: "Failed to remove tags",
        });
      }
    }
  );

  // Upload media file
  fastify.post(
    "/media/upload",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const data = await request.file();

        if (!data) {
          reply.status(400).send({
            success: false,
            error: "No file uploaded",
          });
          return;
        }

        const result = await mediaService.uploadMediaFile(data);

        reply.send({
          success: true,
          data: result,
          message: "File uploaded successfully",
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          error: "Failed to upload file",
        });
      }
    }
  );

  // Delete media file
  fastify.delete(
    "/media/:id",
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;
        const result = await mediaService.deleteMediaFile(id);

        if (!result) {
          reply.status(404).send({
            success: false,
            error: "Media file not found or failed to delete",
          });
          return;
        }

        reply.send({
          success: true,
          message: "Media file deleted successfully",
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          error: "Failed to delete media file",
        });
      }
    }
  );

  // Scan media directory
  fastify.post(
    "/media/scan",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const result = await mediaService.scanMediaDirectory();

        reply.send({
          success: true,
          data: result,
          message: "Media directory scanned successfully",
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          error: "Failed to scan media directory",
        });
      }
    }
  );
}
