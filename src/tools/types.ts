export interface PropertyMeta {
  type: string;
  description: string;
}

export interface InputSchema {
  type: string;
  properties?: {
    ["key"]: PropertyMeta;
  };
  required?: string[];
}
export interface Tool {
  name: string;
  description: string;
  inputSchema: InputSchema;
}
