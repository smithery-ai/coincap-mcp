# Coincap MCP

## What does this server do?

Allows you to query crypto information from coincap

## Tools

#### Bitcoin Price Tool

Gets price for Bitcoin specifically, it's a simple example of a primitive API call tool

#### Get Crypto Price Tool

Gets price for any cryptocurrency available on coincap API. It's a good example of how to get mandatory parameter data for your tool calls

#### List Assets

Gets a list of all crypto assets available in coincap API

## How to use

You can build it locally for now, I will publish this to npx eventually...

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "coincap-mcp": {
      "command": "/path/to/coincap-mcp/build/index.js"
    }
  }
}
```

## Development

Install dependencies:

```bash
npm install
```

Build the server:

```bash
npm run build
```

For development with auto-rebuild:

```bash
npm run watch
```
