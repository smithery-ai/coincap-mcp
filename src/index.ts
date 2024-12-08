#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { CONSTANTS } from "./constants.js";
import CryptoPriceTool from "./tools/CryptoPriceTool.js";

// const bitcoinPrice = new BitcoinPriceTool();
const cryptoPrice = new CryptoPriceTool();
const { PROJECT_NAME, PROJECT_VERSION } = CONSTANTS;

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
    tools: [cryptoPrice.toolDefinition],
  };
});

/**
 * Handler for tool calls.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case cryptoPrice.name:
      return cryptoPrice.toolCall(request);

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
