import { BaseTool } from "../tools/BaseTool.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { promises as fs } from "fs";

async function findToolsPath(): Promise<string> {
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDir = dirname(currentFilePath);

  const possiblePaths = [
    join(currentDir, "..", "tools"),
    join(currentDir, "..", "..", "build", "tools"),
    join(dirname(dirname(currentDir)), "tools"),
    join(dirname(dirname(dirname(currentDir))), "build", "tools"),
  ];

  console.log("Searching for tools in:");
  console.log(possiblePaths.join("\n"));

  for (const path of possiblePaths) {
    try {
      const stats = await fs.stat(path);
      if (stats.isDirectory()) {
        const files = await fs.readdir(path);
        if (
          files.some(
            (file) => file.endsWith(".js") && !file.includes("BaseTool")
          )
        ) {
          console.log(`Found tools directory at: ${path}`);
          return path;
        }
      }
    } catch (error) {
      console.log(`Path ${path} not accessible`);
    }
  }

  throw new Error("Could not find tools directory");
}

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
  try {
    const toolsPath = await findToolsPath();
    console.log(`Loading tools from: ${toolsPath}`);

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
        console.log(`Attempting to import from: ${modulePath}`);

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
        console.error(
          "Error details:",
          error instanceof Error ? error.stack : String(error)
        );
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
    console.error(`Failed to load tools:`, error);
    return [];
  }
}

export function createToolsMap(tools: BaseTool[]): Map<string, BaseTool> {
  return new Map(tools.map((tool) => [tool.name, tool]));
}
