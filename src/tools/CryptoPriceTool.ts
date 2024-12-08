import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { CONSTANTS } from "../constants.js";
import { z } from "zod";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

class CryptoPriceTool {
  name = "crypto_price";
  toolDefinition: Tool = {
    name: this.name,
    description: "Get realtime crypto price on crypto that isn't Bitcoin",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the crypto coin that isn't Bitcoin",
        },
      },
    },
  };

  toolCall = async (request: z.infer<typeof CallToolRequestSchema>) => {
    try {
      const cryptoName = request.params.arguments?.name;
      const url = CONSTANTS.CRYPTO_PRICE_URL + cryptoName;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Error fetching coincap data");
      }

      const body = await response.json();

      return {
        content: [{ type: "text", text: `${JSON.stringify(body.data)}` }],
      };
    } catch (error) {
      return {
        content: [
          { type: "error", text: JSON.stringify((error as any).message) },
        ],
      };
    }
  };
}

export default CryptoPriceTool;
