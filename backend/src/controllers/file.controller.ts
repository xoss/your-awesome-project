import { FastifyRequest, FastifyReply } from 'fastify'
import { FileService } from '../services/file.service'

const fileService = new FileService()

export class FileController {
  async uploadAvatar(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' })
      }

      const data = await request.file()
      
      if (!data) {
        return reply.status(400).send({ error: 'No file uploaded' })
      }

      const buffer = await data.file.toBuffer()
      const avatarUrl = await fileService.uploadAvatar(request.user.id, buffer, data.mimetype)
      
      reply.status(200).send({
        message: 'Avatar uploaded successfully',
        avatarUrl
      })
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message })
      } else {
        reply.status(500).send({ error: 'Internal server error' })
      }
    }
  }

  async getAvatar(request: FastifyRequest<{ Params: { filename: string } }>, reply: FastifyReply) {
    try {
      const stream = await fileService.getFileStream('avatars', request.params.filename)
      const fileInfo = await fileService.getFileInfo('avatars', request.params.filename)
      
      reply.type(fileInfo.metaData?.['content-type'] || 'image/jpeg')
      return reply.send(stream)
    } catch (error) {
      reply.status(404).send({ error: 'File not found' })
    }
  }

  async getDocument(request: FastifyRequest<{ Params: { filename: string } }>, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' })
      }

      const stream = await fileService.getFileStream('documents', request.params.filename)
      const fileInfo = await fileService.getFileInfo('documents', request.params.filename)
      
      reply.type(fileInfo.metaData?.['content-type'] || 'application/octet-stream')
      return reply.send(stream)
    } catch (error) {
      reply.status(404).send({ error: 'File not found' })
    }
  }
}