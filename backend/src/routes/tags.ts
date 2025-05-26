import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../config/database";

export async function tagRoutes(fastify: FastifyInstance) {
  // Get all tags
  fastify.get("/tags", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await db.query(`
        SELECT id, name, color, created_at,
               (SELECT COUNT(*) FROM media_tags WHERE tag_id = tags.id) as media_count
        FROM tags 
        ORDER BY name ASC
      `);

      reply.send({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: "Failed to fetch tags",
      });
    }
  });

  // Create new tag
  fastify.post(
    "/tags",
    async (
      request: FastifyRequest<{
        Body: { name: string; color?: string };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { name, color } = request.body;

        const result = await db.query(
          "INSERT INTO tags (name, color) VALUES ($1, $2) RETURNING *",
          [name, color || "#6B7280"]
        );

        reply.status(201).send({
          success: true,
          data: result.rows[0],
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          error: "Failed to create tag",
        });
      }
    }
  );

  // Update tag
  fastify.put(
    "/tags/:id",
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: { name?: string; color?: string };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;
        const { name, color } = request.body;

        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (name) {
          updates.push(`name = $${paramIndex}`);
          values.push(name);
          paramIndex++;
        }

        if (color) {
          updates.push(`color = $${paramIndex}`);
          values.push(color);
          paramIndex++;
        }

        if (updates.length === 0) {
          reply.status(400).send({
            success: false,
            error: "No fields to update",
          });
          return;
        }

        values.push(id);
        const query = `UPDATE tags SET ${updates.join(
          ", "
        )} WHERE id = $${paramIndex} RETURNING *`;

        const result = await db.query(query, values);

        if (result.rows.length === 0) {
          reply.status(404).send({
            success: false,
            error: "Tag not found",
          });
          return;
        }

        reply.send({
          success: true,
          data: result.rows[0],
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          error: "Failed to update tag",
        });
      }
    }
  );

  // Delete tag
  fastify.delete(
    "/tags/:id",
    async (
      request: FastifyRequest<{
        Params: { id: string };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;

        const result = await db.query(
          "DELETE FROM tags WHERE id = $1 RETURNING *",
          [id]
        );

        if (result.rows.length === 0) {
          reply.status(404).send({
            success: false,
            error: "Tag not found",
          });
          return;
        }

        reply.send({
          success: true,
          message: "Tag deleted successfully",
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          error: "Failed to delete tag",
        });
      }
    }
  );
}
