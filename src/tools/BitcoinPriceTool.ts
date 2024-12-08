import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { BITCOIN_PRICE_URL } from "../constants.js";

class BitcoinPriceTool {
  toolDefinition: Tool = {
    name: "bitcoin_price",
    description: "Get realtime bitcoin price",
    inputSchema: {
      type: "object",
    },
  };

  toolCall = async () => {
    try {
      const response = await fetch(BITCOIN_PRICE_URL);
      if (!response.ok) {
        throw new Error("Error fetching coincap data");
      }

      const body = await response.json();

      return {
        content: [{ type: "text", text: `${JSON.stringify(body)}` }],
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

export default BitcoinPriceTool;
