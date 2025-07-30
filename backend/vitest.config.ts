import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    test: {
      globals: true,
      environment: 'node',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.{js,ts}'],
      exclude: ['node_modules', 'dist'],
      env: {
        DATABASE_URL: env.DATABASE_URL || "postgresql://test:test@localhost:5432/testdb",
        JWT_SECRET: env.JWT_SECRET || "test-secret-key-for-testing",
        MINIO_ENDPOINT: env.MINIO_ENDPOINT || "localhost:9000",
        MINIO_ACCESS_KEY: env.MINIO_ACCESS_KEY || "minioadmin",
        MINIO_SECRET_KEY: env.MINIO_SECRET_KEY || "minioadmin",
        MAX_FILE_SIZE: env.MAX_FILE_SIZE || "5242880",
        ALLOWED_FILE_TYPES: env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/gif,image/webp"
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        thresholds: {
          global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
          }
        },
        exclude: [
          'node_modules/',
          'dist/',
          'src/test/',
          '**/*.d.ts',
          '**/*.config.*',
          '**/types/**'
        ]
      },
      // Enforce test quality - fail on first test failure
      bail: 1,
      // Require tests to pass before allowing builds
      reporter: ['verbose', 'junit'],
      outputFile: 'test-results.xml'
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src')
      }
    }
  }
})