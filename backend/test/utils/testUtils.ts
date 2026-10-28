import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { getModelToken } from '@nestjs/mongoose';

/**
 * Tạo testing module với providers
 */
export const createTestingModule = async (
  providers: any[],
): Promise<TestingModule> => {
  const module: TestingModule = await Test.createTestingModule({
    providers,
  }).compile();

  return module;
};

/**
 * Tạo testing module với Mongoose connection
 * Dùng cho integration tests với MongoDB Memory Server
 */
export const createTestingModuleWithMongoose = async (
  mongoUri: string,
  imports: any[],
  providers: any[],
): Promise<TestingModule> => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [MongooseModule.forRoot(mongoUri), ...imports],
    providers,
  }).compile();

  return module;
};

/**
 * Lấy model token cho Mongoose schema
 */
export const getModelTokenForSchema = (modelName: string): string => {
  return getModelToken(modelName) as string;
};
