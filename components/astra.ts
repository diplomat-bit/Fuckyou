

// --- CONSOLIDATED FROM: ./lib/astra.ts ---

import { DataAPIClient, Db } from "@datastax/astra-db-ts";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.ASTRA_DB_APPLICATION_TOKEN || !process.env.ASTRA_DB_API_ENDPOINT) {
  throw new Error("ASTRA_DB_APPLICATION_TOKEN and ASTRA_DB_API_ENDPOINT must be defined in environment");
}

const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);

export const db: Db = client.db(process.env.ASTRA_DB_API_ENDPOINT, {
  keyspace: process.env.ASTRA_DB_KEYSPACE || "default_keyspace",
});
