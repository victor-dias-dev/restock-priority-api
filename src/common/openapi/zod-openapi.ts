import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ZodTypeAny } from 'zod';

type JsonSchemaConverter = (
  schema: ZodTypeAny,
  options?: { target?: 'openApi3' },
) => SchemaObject & { $schema?: string };

export function zodToOpenApiSchema(schema: ZodTypeAny): SchemaObject {
  // zod-to-json-schema's exported generics blow up under strict TypeScript.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const loaded = require('zod-to-json-schema') as { zodToJsonSchema: JsonSchemaConverter };
  const document = loaded.zodToJsonSchema(schema, { target: 'openApi3' });
  delete document.$schema;
  return document;
}
