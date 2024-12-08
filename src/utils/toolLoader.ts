import { BaseTool } from "../tools/BaseTool.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { promises as fs } from "fs";

const findRootDir = () => {
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDir = dirname(currentFilePath);
  return join(currentDir, "..", "..");
};

const isToolFile = (file: string): boolean => {
  return (
    file.endsWith(".js") &&
    file !== "BaseTool.js" &&
    !file.endsWith(".test.js") &&
    !file.endsWith(".spec.js")
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
  const rootDir = findRootDir();
  const toolsPath = join(rootDir, "build", "tools");

  try {
    const files = await fs.readdir(toolsPath);

    const toolPromises = files.filter(isToolFile).map(async (file) => {
      try {
        const modulePath = `file://${join(toolsPath, file)}`;
        const { default: ToolClass } = await import(modulePath);

        if (!ToolClass) return null;

        const tool = new ToolClass();
        return validateTool(tool) ? tool : null;
      } catch {
        return null;
      }
    });

    const tools = (await Promise.all(toolPromises)).filter(
      Boolean
    ) as BaseTool[];
    return tools;
  } catch (error) {
    console.error(`Failed to load tools from ${toolsPath}`);
    return [];
  }
}

export function createToolsMap(tools: BaseTool[]): Map<string, BaseTool> {
  return new Map(tools.map((tool) => [tool.name, tool]));
}
