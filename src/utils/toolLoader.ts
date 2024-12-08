import { BaseTool } from "../tools/BaseTool.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { promises as fs } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function loadTools(): Promise<BaseTool[]> {
  const toolsDir = join(__dirname, "..", "tools");
  const files = await fs.readdir(toolsDir);
  const tools: BaseTool[] = [];

  for (const file of files) {
    if (file === "BaseTool.ts" || !file.endsWith(".ts")) continue;

    const modulePath = `../tools/${file.replace(".ts", ".js")}`;
    const ToolClass = (await import(modulePath)).default;

    if (
      ToolClass?.prototype?.toolCall &&
      ToolClass?.prototype?.toolDefinition
    ) {
      const tool = new ToolClass();
      tools.push(tool);
    }
  }

  return tools;
}

export function createToolsMap(tools: BaseTool[]): Map<string, BaseTool> {
  return new Map(tools.map((tool) => [tool.name, tool]));
}
