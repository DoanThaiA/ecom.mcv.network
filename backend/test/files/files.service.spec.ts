import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from '../../src/files/files.service';
import { FileRepository } from '../../src/files/infrastructure/persistence/file.repository';
import { File } from '../../src/files/domain/file';

describe('FilesService', () => {
  let service: FilesService;
  let fileRepository: jest.Mocked<FileRepository>;

  const mockFile: File = {
    id: 'file-123',
    path: '/uploads/test-file.jpg',
  };

  const mockFile2: File = {
    id: 'file-456',
    path: '/uploads/test-file-2.jpg',
  };

  beforeEach(async () => {
    const mockFileRepository = {
      findById: jest.fn(),
      findByIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: FileRepository, useValue: mockFileRepository },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    fileRepository = module.get(FileRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return file by id', async () => {
      fileRepository.findById.mockResolvedValue(mockFile);

      const result = await service.findById('file-123');

      expect(result).toEqual(mockFile);
      expect(fileRepository.findById).toHaveBeenCalledWith('file-123');
      expect(fileRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should return null when file not found', async () => {
      fileRepository.findById.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
      expect(fileRepository.findById).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('findByIds', () => {
    it('should return multiple files by ids', async () => {
      const files = [mockFile, mockFile2];
      fileRepository.findByIds.mockResolvedValue(files);

      const result = await service.findByIds(['file-123', 'file-456']);

      expect(result).toEqual(files);
      expect(result).toHaveLength(2);
      expect(fileRepository.findByIds).toHaveBeenCalledWith([
        'file-123',
        'file-456',
      ]);
    });

    it('should return empty array when no files found', async () => {
      fileRepository.findByIds.mockResolvedValue([]);

      const result = await service.findByIds([
        'non-existent-1',
        'non-existent-2',
      ]);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return partial results when some files found', async () => {
      fileRepository.findByIds.mockResolvedValue([mockFile]);

      const result = await service.findByIds(['file-123', 'non-existent']);

      expect(result).toEqual([mockFile]);
      expect(result).toHaveLength(1);
    });

    it('should handle empty ids array', async () => {
      fileRepository.findByIds.mockResolvedValue([]);

      const result = await service.findByIds([]);

      expect(result).toEqual([]);
      expect(fileRepository.findByIds).toHaveBeenCalledWith([]);
    });
  });
});
