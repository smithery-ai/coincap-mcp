#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

interface PropertyMeta {
  type: string;
  description: string;
}

interface InputSchema {
  type: string;
  properties?: {
    ["key"]: PropertyMeta;
  };
  required?: string[];
}
interface Tool {
  name: string;
  description: string;
  inputSchema: InputSchema;
}

const bitcoinPriceTool: Tool = {
  name: "bitcoin_price",
  description: "Get realtime crypto price",
  inputSchema: {
    type: "object",
  },
};

/**
 * Create an MCP server with capabilities for tools
 */
const server = new Server(
  {
    name: "coincap-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handler that lists available tools.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [bitcoinPriceTool],
  };
});

/**
 * Handler for tool calls.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    // Turn this into a BitcoinPriceTool.call() or execute()
    case "bitcoin_price": {
      const bitcoinPriceUrl = "https://api.coincap.io/v2/assets/bitcoin";
      try {
        const response = await fetch(bitcoinPriceUrl);
        if (!response.ok) {
          throw new Error("Error fetching coincap data");
        }

        const body = await response.json();

        return {
          content: [{ type: "text", text: `${JSON.stringify(body)}` }],
        };
      } catch (error) {
        return {
          content: [
            { type: "error", text: JSON.stringify((error as any).message) },
          ],
        };
      }
    }

    default:
      throw new Error("Unknown tool");
  }
});

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
