import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { StorageService } from "../services/storageService";

const storageService = new StorageService();

export async function storageRoutes(fastify: FastifyInstance) {
  // Get storage information
  fastify.get(
    "/storage",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const storageInfo = await storageService.getStorageInfo();

        reply.send({
          success: true,
          data: storageInfo,
        });
      } catch (error) {
        fastify.log.error("Error getting storage info:", error);
        reply.status(500).send({
          success: false,
          error: "Failed to fetch storage information",
        });
      }
    }
  );
}
