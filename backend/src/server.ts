import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import staticFiles from "@fastify/static";
import * as dotenv from "dotenv";
import * as path from "path";
import { mediaRoutes } from "./routes/media";
import { tagRoutes } from "./routes/tags";
import * as fs from "fs/promises";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === "development" ? "debug" : "info",
  },
});

async function buildServer() {
  try {
    // Register plugins
    await fastify.register(cors, {
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Define allowed origins
        const allowedOrigins = [
          "http://localhost:3000",
          "http://127.0.0.1:3000",
          "http://localhost:3001", // Additional frontend port if needed
        ];

        // If NODE_ENV is production, also check CORS_ORIGIN environment variable
        if (process.env.NODE_ENV === "production" && process.env.CORS_ORIGIN) {
          allowedOrigins.push(process.env.CORS_ORIGIN);
        }

        if (
          allowedOrigins.includes(origin) ||
          process.env.NODE_ENV !== "production"
        ) {
          return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"), false);
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    });

    await fastify.register(jwt, {
      secret: process.env.JWT_SECRET || "your-secret-key",
    });

    await fastify.register(multipart, {
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
        files: 10, // Allow up to 10 files
      },
    });

    // Serve static files for thumbnails
    await fastify.register(staticFiles, {
      root: path.join(__dirname, "../data/thumbs"),
      prefix: "/thumbs/",
      decorateReply: false,
    });

    // Serve static files for original images
    await fastify.register(staticFiles, {
      root: path.join(__dirname, "../data/originals"),
      prefix: "/originals/",
      decorateReply: false,
    });

    // Health check endpoint
    fastify.get("/health", async (request, reply) => {
      return { status: "ok", timestamp: new Date().toISOString() };
    });

    // API routes
    await fastify.register(async function (fastify) {
      fastify.addHook("preHandler", async (request, reply) => {
        // Skip authentication for health check and public endpoints
        const publicPaths = ["/health", "/api/media", "/api/tags"];
        const isPublicPath = publicPaths.some((path) =>
          request.url.startsWith(path)
        );

        if (!isPublicPath) {
          try {
            await request.jwtVerify();
          } catch (err) {
            reply.send(err);
          }
        }
      });

      await fastify.register(mediaRoutes, { prefix: "/api" });
      await fastify.register(tagRoutes, { prefix: "/api" });
    });

    // 404 handler
    fastify.setNotFoundHandler((request, reply) => {
      reply.status(404).send({
        success: false,
        error: "Route not found",
      });
    });

    // Error handler
    fastify.setErrorHandler((error, request, reply) => {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

async function ensureDirectories() {
  const originalsPath = process.env.MEDIA_ORIGINALS_PATH || "./data/originals";
  const thumbsPath = process.env.MEDIA_THUMBS_PATH || "./data/thumbs";

  await fs.mkdir(originalsPath, { recursive: true });
  await fs.mkdir(thumbsPath, { recursive: true });
}

async function start() {
  try {
    // Ensure required directories exist
    await ensureDirectories();

    await buildServer();

    const port = parseInt(process.env.PORT || "8000");
    const host = process.env.HOST || "0.0.0.0";

    await fastify.listen({ port, host });
    fastify.log.info(`Vaulta API server listening on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (require.main === module) {
  start();
}

export { fastify };
export default start;
