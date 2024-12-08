#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { CONSTANTS } from "./constants.js";
import { loadTools, createToolsMap } from "./utils/toolLoader.js";

const { PROJECT_NAME, PROJECT_VERSION } = CONSTANTS;

let toolsMap: Map<string, any>;

/**
 * Create an MCP server with tool capabilities
 */
const server = new Server(
  {
    name: PROJECT_NAME,
    version: PROJECT_VERSION,
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
    tools: Array.from(toolsMap.values()).map((tool) => tool.toolDefinition),
  };
});

/**
 * Handler for tool calls.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = toolsMap.get(request.params.name);
  if (!tool) {
    throw new Error(
      `Unknown tool: ${request.params.name}. Available tools: ${Array.from(
        toolsMap.keys()
      ).join(", ")}`
    );
  }
  return tool.toolCall(request);
});

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  try {
    const tools = await loadTools();
    toolsMap = createToolsMap(tools);

    const transport = new StdioServerTransport();
    await server.connect(transport);
  } catch (error) {
    console.error("Error during initialization:", error);
    throw error;
  }
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
