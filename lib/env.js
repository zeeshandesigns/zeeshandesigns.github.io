// Load environment variables from .env file manually for Edge runtime
import { config } from "dotenv";
import { resolve } from "path";

// Load .env file
config({ path: resolve(process.cwd(), ".env") });

export const DATABASE_URL = process.env.DATABASE_URL;
export const DIRECT_URL = process.env.DIRECT_URL;
