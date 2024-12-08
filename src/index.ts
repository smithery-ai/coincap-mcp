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

const server = new Server(
  {
    name: PROJECT_NAME,
    version: PROJECT_VERSION,
  },
  {
    capabilities: {
      tools: {
        enabled: true,
      },
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = Array.from(toolsMap.values()).map(
    (tool) => tool.toolDefinition
  );
  return {
    tools,
  };
});

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

async function main() {
  try {
    const tools = await loadTools();
    toolsMap = createToolsMap(tools);

    if (tools.length === 0) {
      console.error("No tools were loaded!");
    } else {
      console.log(
        `Loaded ${tools.length} tools:`,
        tools.map((t) => t.name).join(", ")
      );
    }

    const transport = new StdioServerTransport();
    await server.connect(transport);
  } catch (error) {
    console.error("Error during initialization:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
