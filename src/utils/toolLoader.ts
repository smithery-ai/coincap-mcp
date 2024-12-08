import { BaseTool } from "../tools/BaseTool.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { promises as fs } from "fs";

const findRootDir = () => {
  const currentFilePath = fileURLToPath(import.meta.url);
  return dirname(dirname(dirname(currentFilePath)));
};

const isToolFile = (file: string): boolean => {
  return (
    file.endsWith(".js") &&
    file !== "BaseTool.js" &&
    !file.endsWith(".test.js") &&
    !file.endsWith(".spec.js") &&
    !file.endsWith(".d.js") &&
    !file.includes("index")
  );
};

const validateTool = (tool: any): tool is BaseTool => {
  return Boolean(
    tool &&
      typeof tool.name === "string" &&
      tool.toolDefinition &&
      typeof tool.toolCall === "function"
  );
};

export async function loadTools(): Promise<BaseTool[]> {
  try {
    const rootDir = findRootDir();
    const toolsPath = join(rootDir, "build", "tools");

    const files = await fs.readdir(toolsPath);
    const tools: BaseTool[] = [];

    for (const file of files.filter(isToolFile)) {
      try {
        const modulePath = `file://${join(toolsPath, file)}`;
        const { default: ToolClass } = await import(modulePath);

        if (ToolClass) {
          const tool = new ToolClass();
          if (validateTool(tool)) {
            tools.push(tool);
          }
        }
      } catch (error) {
        console.error(`Failed to load tool from ${file}:`, error);
      }
    }

    return tools;
  } catch (error) {
    console.error(`Failed to load tools:`, error);
    return [];
  }
}

export function createToolsMap(tools: BaseTool[]): Map<string, BaseTool> {
  return new Map(tools.map((tool) => [tool.name, tool]));
}
