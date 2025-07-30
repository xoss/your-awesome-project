import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'
import './mocks/prisma'

// Mock environment variables for testing
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb'
process.env.JWT_SECRET = 'test-secret-key-for-testing'
process.env.MINIO_ENDPOINT = 'localhost:9000'
process.env.MINIO_ACCESS_KEY = 'minioadmin'
process.env.MINIO_SECRET_KEY = 'minioadmin'
process.env.MAX_FILE_SIZE = '5242880'
process.env.ALLOWED_FILE_TYPES = 'image/jpeg,image/png,image/gif,image/webp'

beforeAll(async () => {
  // Setup test environment
})

afterAll(async () => {
  // Cleanup test environment
})

beforeEach(async () => {
  // Clear all mocks before each test
  vi.clearAllMocks()
})

afterEach(async () => {
  // Additional cleanup if needed
})