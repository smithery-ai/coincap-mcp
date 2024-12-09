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
    !file.includes("BaseTool") &&
    !file.includes("index") &&
    !file.endsWith(".test.js") &&
    !file.endsWith(".spec.js") &&
    !file.endsWith(".d.js")
  );
};

export async function loadTools(): Promise<BaseTool[]> {
  const rootDir = findRootDir();
  const toolsPath = join(rootDir, "build", "tools");
  console.log(`Loading tools from: ${toolsPath}`);

  try {
    const files = await fs.readdir(toolsPath);
    console.log(`Found files: ${files.join(", ")}`);

    const tools: BaseTool[] = [];

    for (const file of files) {
      if (!isToolFile(file)) {
        console.log(`Skipping file: ${file}`);
        continue;
      }

      try {
        console.log(`Loading tool from file: ${file}`);
        const modulePath = `file://${join(toolsPath, file)}`;
        const { default: ToolClass } = await import(modulePath);

        if (!ToolClass) {
          console.log(`No default export in ${file}`);
          continue;
        }

        const tool = new ToolClass();

        if (
          tool.name &&
          tool.toolDefinition &&
          typeof tool.toolCall === "function"
        ) {
          console.log(`Successfully loaded tool: ${tool.name}`);
          tools.push(tool);
        } else {
          console.log(`Invalid tool in ${file}: missing required properties`);
        }
      } catch (error) {
        console.error(`Error loading tool from ${file}:`, error);
      }
    }

    if (tools.length === 0) {
      console.warn("No tools were loaded!");
    } else {
      console.log(
        `Successfully loaded ${tools.length} tools:`,
        tools.map((t) => t.name).join(", ")
      );
    }

    return tools;
  } catch (error) {
    console.error(`Failed to load tools from ${toolsPath}:`, error);
    return [];
  }
}

export function createToolsMap(tools: BaseTool[]): Map<string, BaseTool> {
  return new Map(tools.map((tool) => [tool.name, tool]));
}
