import { Client } from 'minio'
import sharp from 'sharp'
import { env } from '../config/env'
import { prisma } from '../config/database'

export class FileService {
  private minioClient: Client

  constructor() {
    this.minioClient = new Client({
      endPoint: env.MINIO_ENDPOINT.split(':')[0] || 'localhost',
      port: parseInt(env.MINIO_ENDPOINT.split(':')[1] || '9000'),
      useSSL: false,
      accessKey: env.MINIO_ACCESS_KEY,
      secretKey: env.MINIO_SECRET_KEY
    })

    this.initializeBuckets()
  }

  private async initializeBuckets() {
    const buckets = ['avatars', 'documents']
    
    for (const bucket of buckets) {
      const exists = await this.minioClient.bucketExists(bucket)
      if (!exists) {
        await this.minioClient.makeBucket(bucket)
        
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucket}/*`]
            }
          ]
        }
        
        await this.minioClient.setBucketPolicy(bucket, JSON.stringify(policy))
      }
    }
  }

  async uploadAvatar(userId: string, file: Buffer, mimetype: string): Promise<string> {
    if (!this.isImageFile(mimetype)) {
      throw new Error('Only image files are allowed')
    }

    if (file.length > env.MAX_FILE_SIZE) {
      throw new Error('File size too large')
    }

    const processedImage = await sharp(file)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 90 })
      .toBuffer()

    const fileName = `${userId}-${Date.now()}.jpg`
    
    await this.minioClient.putObject(
      'avatars',
      fileName,
      processedImage,
      processedImage.length,
      {
        'Content-Type': 'image/jpeg'
      }
    )

    const avatarUrl = `/api/files/avatars/${fileName}`

    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl }
    })

    return avatarUrl
  }

  async getFileStream(bucket: string, fileName: string) {
    try {
      const stream = await this.minioClient.getObject(bucket, fileName)
      return stream
    } catch (error) {
      throw new Error('File not found')
    }
  }

  async deleteFile(bucket: string, fileName: string) {
    try {
      await this.minioClient.removeObject(bucket, fileName)
      return true
    } catch (error) {
      return false
    }
  }

  private isImageFile(mimetype: string): boolean {
    const allowedTypes = env.ALLOWED_FILE_TYPES.split(',')
    return allowedTypes.includes(mimetype)
  }

  async getFileInfo(bucket: string, fileName: string) {
    try {
      const stat = await this.minioClient.statObject(bucket, fileName)
      return stat
    } catch (error) {
      throw new Error('File not found')
    }
  }
}