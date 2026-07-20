import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "The local-only website does not configure a Cloudflare D1 database."
    );
  }

  return drizzle(env.DB, { schema });
}
