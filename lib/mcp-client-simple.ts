import { Recipe } from "./types";

const MCP_SERVER_URL = "https://recipes-mcp.fly.dev/mcp";

// Simple HTTP-based MCP client that doesn't use SSE
// This works better in serverless environments like Next.js API routes
export async function searchRecipes(query: string): Promise<Recipe[]> {
  let sessionId: string | null = null;

  try {
    // Step 1: Initialize the session
    const initResponse = await fetch(MCP_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: {
            name: "middagsassistent",
            version: "1.0.0",
          },
        },
      }),
    });

    if (!initResponse.ok) {
      const errorText = await initResponse.text();
      throw new Error(`Initialize failed: ${initResponse.status} ${initResponse.statusText} - ${errorText.substring(0, 200)}`);
    }

    // Get session ID from header FIRST (before reading body)
    // Server returns it as lowercase 'mcp-session-id'
    // Headers are case-insensitive in fetch API
    const rawSessionId = initResponse.headers.get("mcp-session-id") || 
                         initResponse.headers.get("Mcp-Session-Id");
    
    // Clean up the session ID - remove any header name prefix if present
    sessionId = rawSessionId ? rawSessionId.replace(/^[Mm]cp-[Ss]ession-[Ii]d\s*/i, "").trim() : null;
    
    // Parse the SSE response to verify it worked
    const initText = await initResponse.text();
    console.log("Initialize response:", initText.substring(0, 500));
    
    // Parse SSE format (event: message\ndata: {...})
    const initLines = initText.split("\n");
    let initData: any = null;
    for (const line of initLines) {
      if (line.startsWith("data: ")) {
        try {
          initData = JSON.parse(line.slice(6));
          break;
        } catch (e) {
          // Continue
        }
      }
    }
    
    if (!initData) {
      // Try parsing as regular JSON (fallback)
      try {
        initData = JSON.parse(initText);
      } catch (e) {
        throw new Error(`Failed to parse initialize response: ${initText.substring(0, 200)}`);
      }
    }
    
    if (initData.error) {
      throw new Error(initData.error.message || "Initialize response error");
    }
    
    if (!sessionId) {
      throw new Error("No session ID received from server in header");
    }
    
    console.log("Session ID received:", sessionId);

    // Step 2: List tools
    const toolsResponse = await fetch(MCP_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Mcp-Session-Id": sessionId,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list",
        params: {},
      }),
    });

    if (!toolsResponse.ok) {
      const errorText = await toolsResponse.text();
      throw new Error(`List tools failed: ${toolsResponse.status} ${toolsResponse.statusText} - ${errorText.substring(0, 200)}`);
    }

    const toolsData = await toolsResponse.json();
    console.log("Tools response:", JSON.stringify(toolsData, null, 2).substring(0, 500));
    if (toolsData.error) {
      throw new Error(`Tools list error: ${toolsData.error.message || JSON.stringify(toolsData.error)}`);
    }

    const tools = toolsData.result?.tools || [];
    console.log(`Found ${tools.length} tools:`, tools.map((t: any) => t.name));
    
    const searchTool = tools.find(
      (tool: any) => tool.name === "find_recipes" || tool.name === "find_recipies"
    );

    if (!searchTool) {
      throw new Error(`find_recipes tool not found. Available tools: ${tools.map((t: any) => t.name).join(", ")}`);
    }
    
    console.log("Using tool:", searchTool.name);

    // Step 3: Call the tool
    const toolCallRequest = {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: searchTool.name,
        arguments: {
          q: query,
        },
      },
    };
    
    console.log("Calling tool with request:", JSON.stringify(toolCallRequest, null, 2));
    
    const callResponse = await fetch(MCP_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Mcp-Session-Id": sessionId,
      },
      body: JSON.stringify(toolCallRequest),
    });

    if (!callResponse.ok) {
      const errorText = await callResponse.text();
      throw new Error(`Tool call failed: ${callResponse.status} ${callResponse.statusText} - ${errorText.substring(0, 200)}`);
    }

    const callData = await callResponse.json();
    console.log("Call response:", JSON.stringify(callData, null, 2).substring(0, 1000));
    if (callData.error) {
      throw new Error(`Tool call error: ${callData.error.message || JSON.stringify(callData.error)}`);
    }

    // Parse the result - it's in result.content[0].text as JSON string
    const content = callData.result?.content || [];
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
    // Try to terminate the session if we have one
    if (sessionId) {
      try {
        await fetch(MCP_SERVER_URL, {
          method: "DELETE",
          headers: {
            "Mcp-Session-Id": sessionId,
          },
        });
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
    .map((item: any) => parseRecipe(item))
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

