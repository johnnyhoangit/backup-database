import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { config } from '../config';
import { logger } from '../utils/logger';
import { S3Service } from './s3';
import { NotificationService } from './notification';

const execAsync = promisify(exec);

export class MySQLBackupService {
  private s3Service: S3Service;
  private notificationService: NotificationService;

  constructor() {
    this.s3Service = new S3Service();
    this.notificationService = new NotificationService();
  }

  private buildMysqldumpCommand(backupPath: string): string {
    const { host, port, user, password, database, dumpOptions } = config.mysql;
    const options = [
      dumpOptions.compress ? '--compress' : '',
      dumpOptions.addDropTable ? '--add-drop-table' : '',
      dumpOptions.addLocks ? '--add-locks' : '',
      dumpOptions.extendedInsert ? '--extended-insert' : '',
      dumpOptions.completeInsert ? '--complete-insert' : '',
      dumpOptions.createOptions ? '--create-options' : '',
      dumpOptions.disableKeys ? '--disable-keys' : '',
      dumpOptions.setCharset ? '--set-charset' : '',
      dumpOptions.delayedInsert ? '--delayed-insert' : '',
      dumpOptions.replace ? '--replace' : '',
      dumpOptions.ignoreTable ? `--ignore-table=${database}.${dumpOptions.ignoreTable}` : '',
      dumpOptions.additionalOptions
    ].filter(Boolean).join(' ');

    return `mysqldump -h${host} -P${port} -u${user} -p${password} ${options} ${database} > ${backupPath}`;
  }

  private buildDockerMysqldumpCommand(backupPath: string): string {
    const { dockerContainer, database, dumpOptions } = config.mysql;
    const options = [
      dumpOptions.compress ? '--compress' : '',
      dumpOptions.addDropTable ? '--add-drop-table' : '',
      dumpOptions.addLocks ? '--add-locks' : '',
      dumpOptions.extendedInsert ? '--extended-insert' : '',
      dumpOptions.completeInsert ? '--complete-insert' : '',
      dumpOptions.createOptions ? '--create-options' : '',
      dumpOptions.disableKeys ? '--disable-keys' : '',
      dumpOptions.setCharset ? '--set-charset' : '',
      dumpOptions.delayedInsert ? '--delayed-insert' : '',
      dumpOptions.replace ? '--replace' : '',
      dumpOptions.ignoreTable ? `--ignore-table=${database}.${dumpOptions.ignoreTable}` : '',
      dumpOptions.additionalOptions
    ].filter(Boolean).join(' ');

    return `docker exec ${dockerContainer} mysqldump -u${config.mysql.user} -p${config.mysql.password} ${options} ${database} > ${backupPath}`;
  }

  private async executeDockerBackup(): Promise<string> {
    const backupPath = this.getBackupPath();
    const command = this.buildDockerMysqldumpCommand(backupPath);
    
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
    const command = this.buildMysqldumpCommand(backupPath);
    
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
      logger.info('Starting database backup');
      
      const backupPath = config.mysql.useDocker
        ? await this.executeDockerBackup()
        : await this.executeLocalBackup();

      logger.info('Backup completed successfully', { path: backupPath });

      if (config.s3.enabled) {
        await this.s3Service.uploadBackup(backupPath);
        logger.info('Backup uploaded to S3 successfully');
      }

      await this.notificationService.sendNotification({
        title: 'Backup Successful',
        message: `Database backup completed successfully.\nDatabase: ${config.mysql.database}\nPath: ${backupPath}`,
        backupPath
      });

    } catch (error) {
      logger.error('Backup process failed', { error });
      
      await this.notificationService.sendNotification({
        title: 'Backup Failed',
        message: `Database backup failed.\nDatabase: ${config.mysql.database}`,
        error: error as Error
      });

      throw error;
    }
  }
} 