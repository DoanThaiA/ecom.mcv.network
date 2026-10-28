import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;

/**
 * Lấy hoặc tạo MongoDB Memory Server instance
 * Reuse single instance across test suites để tăng performance
 */
export const getMongoServer = async (): Promise<MongoMemoryServer> => {
  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create();
  }
  return mongoServer;
};

/**
 * Đóng MongoDB Memory Server
 */
export const closeMongoServer = async (): Promise<void> => {
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
};

/**
 * Lấy MongoDB connection URI
 */
export const getMongoUri = async (): Promise<string> => {
  const server = await getMongoServer();
  return server.getUri();
};
