import { CreatePartSchema } from '../../modules/parts/dto/create-part-dto';
import { zodToOpenApiSchema } from './zod-openapi';

describe('zodToOpenApiSchema', () => {
  it('builds an OpenAPI object schema from the create-part schema', () => {
    const schema = zodToOpenApiSchema(CreatePartSchema);

    expect(schema.type).toBe('object');
    expect(schema.properties).toHaveProperty('name');
    expect(schema.properties).toHaveProperty('unitCost');
    expect(schema).not.toHaveProperty('$schema');
  });
});
