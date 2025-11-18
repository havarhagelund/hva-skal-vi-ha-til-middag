import { createClient } from "@libsql/client";
import { Recipe } from "./types";

const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = process.env;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  console.warn("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN - recipe search will not work");
}

const db = TURSO_DATABASE_URL && TURSO_AUTH_TOKEN
  ? createClient({
      url: TURSO_DATABASE_URL,
      authToken: TURSO_AUTH_TOKEN,
    })
  : null;

const norm = (s: string | null | undefined): string => (s || "").toLowerCase();

interface SearchParams {
  q?: string;
  include?: string;
  exclude?: string;
  maxPrice?: number;
  limit?: number;
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  if (!db) {
    throw new Error("Database not configured. Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables.");
  }

  try {
    const lim = 6; // Default limit
    const searchQuery = query && query.trim() !== "" ? query.trim() : "*";

    // Execute the FTS5 search
    const rows = await db.execute({
      sql: `
        SELECT r.url, r.title, r.image_url, r.price_per_portion, r.intro, r.categories, r.ingredients
        FROM recipes_fts f
        JOIN recipes r ON r.rowid = f.rowid
        WHERE recipes_fts MATCH ?
        ORDER BY bm25(recipes_fts) ASC
        LIMIT ?;
      `,
      args: [searchQuery, lim * 4],
    });

    // Filter results (no include/exclude for now, just return top results)
    const filtered = rows.rows.slice(0, lim);

    // Map to Recipe format
    return filtered
      .map((r: any) => {
        const recipe: Recipe = {
          title: String(r.title || ""),
          image: String(r.image_url || ""),
          url: String(r.url || ""),
          intro: String(r.intro || ""),
          summary: String(r.intro || ""), // Use intro as summary
        };

        // Only return if we have at least a title
        if (!recipe.title) {
          return null;
        }

        return recipe;
      })
      .filter((recipe): recipe is Recipe => recipe !== null);
  } catch (dbError: any) {
    console.error("Database error in searchRecipes:", dbError);
    throw new Error(`Database query failed: ${dbError.message}`);
  }
}

