import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import sensible from '@fastify/sensible'
import redis from '@fastify/redis'

import { env } from './config/env'
import { authRoutes } from './routes/auth.routes'
import { projectRoutes } from './routes/project.routes'
import { fileRoutes } from './routes/file.routes'

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'development' ? 'info' : 'warn'
  }
})

async function buildServer() {
  await fastify.register(sensible)
  
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })

  await fastify.register(cors, {
    origin: env.CORS_ORIGINS.split(','),
    credentials: true
  })

  await fastify.register(rateLimit, {
    max: env.RATE_LIMIT_MAX_REQUESTS,
    timeWindow: env.RATE_LIMIT_WINDOW_MS
  })

  await fastify.register(redis, {
    url: env.REDIS_URL
  })

  await fastify.register(multipart, {
    limits: {
      fileSize: env.MAX_FILE_SIZE
    }
  })

  fastify.get('/health', async () => {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV
    }
  })

  await fastify.register(authRoutes, { prefix: '/api/auth' })
  await fastify.register(projectRoutes, { prefix: '/api/projects' })
  await fastify.register(fileRoutes, { prefix: '/api/files' })

  fastify.setErrorHandler((error, _request, reply) => {
    fastify.log.error(error)
    
    if (error.validation) {
      reply.status(400).send({
        error: 'Validation Error',
        details: error.validation
      })
      return
    }

    if (error.statusCode) {
      reply.status(error.statusCode).send({
        error: error.message
      })
      return
    }

    reply.status(500).send({
      error: 'Internal Server Error'
    })
  })

  return fastify
}

async function start() {
  try {
    const server = await buildServer()
    
    const port = 3001
    const host = '0.0.0.0'
    
    await server.listen({ port, host })
    
    console.log(`🚀 Server ready at http://${host}:${port}`)
    console.log(`🏥 Health check at http://${host}:${port}/health`)
    console.log(`📚 Environment: ${env.NODE_ENV}`)
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  start()
}

export { buildServer }