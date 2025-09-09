export interface SchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  enum?: string[];
  format?: string;
  items?: {
    type: string;
    format?: string;
  };
  properties?: Record<string, SchemaProperty>;
  required?: string[];
}

export interface JSONSchema {
  title: string;
  description: string;
  type: string;
  properties: Record<string, SchemaProperty>;
  required: string[];
  additionalProperties: boolean;
}

export interface ProductSchema {
  id: string;
  category: string;
  eventType: string;
  schema: JSONSchema;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSchemaRequest {
  category: string;
  eventType: string;
  schema: JSONSchema;
}