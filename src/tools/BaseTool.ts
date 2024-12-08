import {
  CallToolRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

export interface BaseTool {
  name: string;
  toolDefinition: Tool;
  toolCall(request: z.infer<typeof CallToolRequestSchema>): Promise<any>;
}
