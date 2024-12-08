#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { CONSTANTS } from "./constants.js";
import GetCryptoPriceTool from "./tools/GetCryptoPrice.js";
import ListAssetsTool from "./tools/ListAssets.js";

const { PROJECT_NAME, PROJECT_VERSION } = CONSTANTS;

const cryptoPrice = new GetCryptoPriceTool();
const listAssets = new ListAssetsTool();

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
    tools: [cryptoPrice.toolDefinition, listAssets.toolDefinition],
  };
});

/**
 * Handler for tool calls.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case cryptoPrice.name:
      return cryptoPrice.toolCall(request);
    case listAssets.name:
      return listAssets.toolCall();

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
