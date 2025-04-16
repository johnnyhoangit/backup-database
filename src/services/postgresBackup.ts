import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { config } from '../config';
import { logger } from '../utils/logger';
import { S3Service } from './s3';
import { NotificationService } from './notification';

const execAsync = promisify(exec);

export class PostgreSQLBackupService {
  private s3Service: S3Service;
  private notificationService: NotificationService;

  constructor() {
    this.s3Service = new S3Service();
    this.notificationService = new NotificationService();
  }

  private buildPgDumpCommand(backupPath: string): string {
    const { host, port, user, password, database, dumpOptions } = config.postgresql;
    const options = [
      dumpOptions.schemaOnly ? '--schema-only' : '',
      dumpOptions.dataOnly ? '--data-only' : '',
      dumpOptions.noOwner ? '--no-owner' : '',
      dumpOptions.noPrivileges ? '--no-privileges' : '',
      dumpOptions.noTablespaces ? '--no-tablespaces' : '',
      dumpOptions.ignoreTable ? `--exclude-table=${dumpOptions.ignoreTable}` : '',
      dumpOptions.additionalOptions
    ].filter(Boolean).join(' ');

    const envVars = {
      PGPASSWORD: password
    };

    const envString = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join(' ');

    return `${envString} pg_dump -h${host} -p${port} -U${user} ${options} ${database} > ${backupPath}`;
  }

  private buildDockerPgDumpCommand(backupPath: string): string {
    const { dockerContainer, database, dumpOptions } = config.postgresql;
    const options = [
      dumpOptions.schemaOnly ? '--schema-only' : '',
      dumpOptions.dataOnly ? '--data-only' : '',
      dumpOptions.noOwner ? '--no-owner' : '',
      dumpOptions.noPrivileges ? '--no-privileges' : '',
      dumpOptions.noTablespaces ? '--no-tablespaces' : '',
      dumpOptions.ignoreTable ? `--exclude-table=${dumpOptions.ignoreTable}` : '',
      dumpOptions.additionalOptions
    ].filter(Boolean).join(' ');

    return `docker exec ${dockerContainer} pg_dump -U${config.postgresql.user} ${options} ${database} > ${backupPath}`;
  }

  private async executeDockerBackup(): Promise<string> {
    const backupPath = this.getBackupPath();
    const command = this.buildDockerPgDumpCommand(backupPath);
    
    try {
      await execAsync(command);
      return backupPath;
    } catch (error) {
      logger.error('Docker backup failed', { error });
      throw error;
    }
  }

  private async executeLocalBackup(): Promise<string> {
    const backupPath = this.getBackupPath();
    const command = this.buildPgDumpCommand(backupPath);
    
    try {
      await execAsync(command);
      return backupPath;
    } catch (error) {
      logger.error('Local backup failed', { error });
      throw error;
    }
  }

  private getBackupPath(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return path.join(
      config.backup.outputDir,
      `${config.backup.filenamePrefix}-${timestamp}.sql`
    );
  }

  public async performBackup(): Promise<void> {
    try {
      logger.info('Starting PostgreSQL database backup');
      
      const backupPath = config.postgresql.useDocker
        ? await this.executeDockerBackup()
        : await this.executeLocalBackup();

      logger.info('Backup completed successfully', { path: backupPath });

      if (config.s3.enabled) {
        await this.s3Service.uploadBackup(backupPath);
        logger.info('Backup uploaded to S3 successfully');
      }

      await this.notificationService.sendNotification({
        title: 'PostgreSQL Backup Successful',
        message: `Database backup completed successfully.\nDatabase: ${config.postgresql.database}\nPath: ${backupPath}`,
        backupPath
      });

    } catch (error) {
      logger.error('Backup process failed', { error });
      
      await this.notificationService.sendNotification({
        title: 'PostgreSQL Backup Failed',
        message: `Database backup failed.\nDatabase: ${config.postgresql.database}`,
        error: error as Error
      });

      throw error;
    }
  }
} 