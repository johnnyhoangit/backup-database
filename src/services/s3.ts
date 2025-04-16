import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createReadStream } from 'fs';
import path from 'path';
import { config } from '../config';
import { logger } from '../utils/logger';

export class S3Service {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: config.s3.region,
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
      },
    });
  }

  public async uploadBackup(backupPath: string): Promise<void> {
    try {
      const fileStream = createReadStream(backupPath);
      const key = path.join(
        config.s3.path,
        path.basename(backupPath)
      );

      const command = new PutObjectCommand({
        Bucket: config.s3.bucket,
        Key: key,
        Body: fileStream,
      });

      await this.s3Client.send(command);
      logger.info('File uploaded to S3 successfully', { key });
    } catch (error) {
      logger.error('S3 upload failed', { error });
      throw error;
    }
  }
} 