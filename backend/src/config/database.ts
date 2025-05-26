import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../../../.env") });

// Parse DATABASE_URL if provided, otherwise use individual environment variables
let poolConfig;

if (process.env.DATABASE_URL) {
  // Use DATABASE_URL for Docker deployment
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
} else {
  // Use individual environment variables for local development
  poolConfig = {
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
    database: process.env.POSTGRES_DB || "vaulta",
    user: process.env.POSTGRES_USER || "vaulta",
    password: process.env.POSTGRES_PASSWORD || "vaulta123",
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

const pool = new Pool(poolConfig);

export const db = {
  query: async (text: string, params?: any[]) => {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log("Executed query", { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  },

  getClient: async () => {
    return await pool.connect();
  },

  end: async () => {
    await pool.end();
  },
};

export default db;
