// Use direct database search instead of MCP client
// This is more reliable and faster for serverless environments
export { searchRecipes } from "./recipe-search";

// Keep the old implementation commented for reference
/*
import { Recipe } from "./types";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

const MCP_SERVER_URL = "https://recipes-mcp.fly.dev/mcp";

// Cache for client connections (in a real app, you'd want proper connection pooling)
let clientInstance: Client | null = null;
let transportInstance: StreamableHTTPClientTransport | null = null;

async function getMCPClient(): Promise<Client> {
  if (clientInstance && transportInstance) {
    return clientInstance;
  }

  const url = new URL(MCP_SERVER_URL);
  const transport = new StreamableHTTPClientTransport(url, {
    fetch: globalThis.fetch,
  });

  const client = new Client(
    {
      name: "middagsassistent",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  client.connect(transport);
  await transport.start();

  clientInstance = client;
  transportInstance = transport;

  return client;
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  let client: Client | null = null;
  let transport: StreamableHTTPClientTransport | null = null;

  try {
    const url = new URL(MCP_SERVER_URL);

    // Create transport first
    transport = new StreamableHTTPClientTransport(url, {
      fetch: globalThis.fetch,
    });

    // Create client
    client = new Client(
      {
        name: "middagsassistent",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    // Set up error handler
    client.onerror = (error) => {
      console.error("MCP client error:", error);
    };

    // Connect client to transport first
    await client.connect(transport);

    // Start the transport (SSE connection) - this sends initialize request
    // The transport.start() will establish the SSE connection and initialize the session
    try {
      await Promise.race([
        transport.start(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("MCP connection timeout after 30 seconds")),
            30000
          )
        ),
      ]);
    } catch (startError) {
      console.error("Transport start failed:", startError);
      throw startError;
    }

    // Wait a bit for initialization to complete
    await new Promise((resolve) => setTimeout(resolve, 500));

    // List available tools
    const toolsResponse = await client.listTools();
    const tools = toolsResponse.tools || [];

    // Find the find_recipes tool (the actual tool name from the server)
    const searchTool = tools.find(
      (tool) => tool.name === "find_recipes" || tool.name === "find_recipies"
    );

    if (!searchTool) {
      console.error("Available tools:", tools.map(t => t.name));
      throw new Error("find_recipes tool not found");
    }

    // Call the search tool with the correct parameter name 'q'
    const result = await client.callTool({
      name: searchTool.name,
      arguments: {
        q: query, // The server expects 'q' parameter, not 'query'
      },
    });

    // Parse the results - the server returns JSON text with { results: [...] }
    const content = Array.isArray(result.content) ? result.content : [];
    
    // The server returns text content with JSON stringified results
    let recipes: any[] = [];
    for (const item of content) {
      if (item.type === "text" && typeof item.text === "string") {
        try {
          const parsed = JSON.parse(item.text);
          if (parsed.results && Array.isArray(parsed.results)) {
            recipes = parsed.results;
            break;
          }
        } catch (e) {
          console.error("Failed to parse recipe response:", e);
        }
      }
    }

    return parseRecipeResults(recipes);
  } catch (error) {
    console.error("Error searching recipes:", error);
    throw error;
  } finally {
    // Clean up connection
    if (transport) {
      try {
        await transport.close();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}

function parseRecipeResults(results: any[]): Recipe[] {
  if (!Array.isArray(results)) {
    return [];
  }

  return results
    .map((item: any) => {
      // Handle different possible response formats
      const text = typeof item === "string" ? item : item.text || "";
      const data = typeof item === "object" && !item.text ? item : {};

      // Try to parse JSON if the text is JSON
      let parsed: any = {};
      if (text) {
        try {
          parsed = JSON.parse(text);
        } catch {
          // If not JSON, try to extract from data
          parsed = data;
        }
      } else {
        parsed = data;
      }

      // Handle array of recipes
      if (Array.isArray(parsed)) {
        return parsed.map(parseRecipe);
      }

      return parseRecipe(parsed);
    })
    .flat()
    .filter((recipe): recipe is Recipe => recipe !== null);
}

function parseRecipe(item: any): Recipe | null {
  if (!item) return null;

  // Handle the server's response format: { url, title, image_url, price_per_portion, intro }
  const recipe: Recipe = {
    title: item.title || item.name || "",
    image: item.image_url || item.image || item.img || item.thumbnail || "",
    url: item.url || item.link || "",
    intro: item.intro || item.description || item.introduction || "",
    summary: item.intro || item.description || item.summary || "",
  };

  // Only return if we have at least a title
  if (!recipe.title) {
    return null;
  }

  return recipe;
}
*/
