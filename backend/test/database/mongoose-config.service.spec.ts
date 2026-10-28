import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MongooseConfigService } from '../../src/database/mongoose-config.service';
import mongooseAutoPopulate from 'mongoose-autopopulate';

jest.mock('mongoose-autopopulate');

describe('MongooseConfigService', () => {
  let service: MongooseConfigService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'database.url') {
          return 'mongodb://localhost:27017/test';
        }
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MongooseConfigService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<MongooseConfigService>(MongooseConfigService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMongooseOptions', () => {
    it('should create mongoose options with database URL from config', () => {
      const options = service.createMongooseOptions();

      expect(options).toEqual({
        uri: 'mongodb://localhost:27017/test',
        connectionFactory: expect.any(Function),
      });
      expect(configService.get).toHaveBeenCalledWith('database.url', {
        infer: true,
      });
    });

    it('should use different database URL when config changes', () => {
      const customUrl = 'mongodb://prod-server:27017/production';
      configService.get.mockImplementation((key: string) => {
        if (key === 'database.url') return customUrl;
        return null;
      });

      const options = service.createMongooseOptions();

      expect(options.uri).toBe(customUrl);
    });

    it('should attach autopopulate plugin to connection', () => {
      const mockConnection = {
        plugin: jest.fn(),
      };

      const options = service.createMongooseOptions();
      const result = options.connectionFactory!(
        mockConnection as any,
        'default',
      );

      expect(mockConnection.plugin).toHaveBeenCalledWith(mongooseAutoPopulate);
      expect(result).toBe(mockConnection);
    });

    it('should return connection from connectionFactory', () => {
      const mockConnection = {
        plugin: jest.fn(),
      };

      const options = service.createMongooseOptions();
      const returnedConnection = options.connectionFactory!(
        mockConnection as any,
        'default',
      );

      expect(returnedConnection).toBe(mockConnection);
    });

    it('should create options object with required properties', () => {
      const options = service.createMongooseOptions();

      expect(options).toHaveProperty('uri');
      expect(options).toHaveProperty('connectionFactory');
      expect(typeof options.uri).toBe('string');
      expect(typeof options.connectionFactory).toBe('function');
    });

    it('should handle replica set URL from config', () => {
      const replicaSetUrl =
        'mongodb://server1:27017,server2:27017,server3:27017/mydb?replicaSet=myReplicaSet';
      configService.get.mockImplementation((key: string) => {
        if (key === 'database.url') return replicaSetUrl;
        return null;
      });

      const options = service.createMongooseOptions();

      expect(options.uri).toBe(replicaSetUrl);
    });

    it('should handle MongoDB Atlas URL from config', () => {
      const atlasUrl =
        'mongodb+srv://username:password@cluster0.mongodb.net/mydb?retryWrites=true&w=majority';
      configService.get.mockImplementation((key: string) => {
        if (key === 'database.url') return atlasUrl;
        return null;
      });

      const options = service.createMongooseOptions();

      expect(options.uri).toBe(atlasUrl);
    });

    it('should create consistent options on multiple calls', () => {
      const options1 = service.createMongooseOptions();
      const options2 = service.createMongooseOptions();

      expect(options1.uri).toBe(options2.uri);
      expect(typeof options1.connectionFactory).toBe(
        typeof options2.connectionFactory,
      );
    });

    it('should apply autopopulate plugin before returning connection', () => {
      const pluginCalls: any[] = [];
      const mockConnection = {
        plugin: jest.fn((plugin) => {
          pluginCalls.push(plugin);
        }),
      };

      const options = service.createMongooseOptions();
      options.connectionFactory!(mockConnection as any, 'default');

      expect(pluginCalls).toContain(mongooseAutoPopulate);
      expect(mockConnection.plugin).toHaveBeenCalledTimes(1);
    });
  });
});
