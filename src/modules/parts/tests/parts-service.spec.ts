import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PartsService } from '../services/parts-service';
import { IPartsRepository, PARTS_REPOSITORY } from '../interfaces/parts-interface';

describe('PartsService', () => {
  const repository: jest.Mocked<IPartsRepository> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllUnpaged: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  let service: PartsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [PartsService, { provide: PARTS_REPOSITORY, useValue: repository }],
    }).compile();
    service = moduleRef.get(PartsService);
  });

  it('throws NotFoundException when the part does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findById('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws NotFoundException when updating a missing part', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.update('missing', { name: 'Pad' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when deleting a missing part', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.delete('missing')).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
