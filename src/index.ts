import { MySQLBackupService } from './services/mysqlBackup';
import { PostgreSQLBackupService } from './services/postgresBackup';
import { logger } from './utils/logger';
import { config } from './config';
import cron from 'node-cron';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function setupDirectories() {
  try {
    await execAsync(`mkdir -p ${config.backup.outputDir}`);
    await execAsync(`mkdir -p ${config.logging.dir}`);
  } catch (error) {
    logger.error('Failed to create directories', { error });
    throw error;
  }
}

async function clearPm2Logs() {
  try {
    await execAsync('pm2 flush');
    logger.info('PM2 logs cleared successfully');
  } catch (error) {
    logger.error('Failed to clear PM2 logs', { error });
  }
}

async function main() {
  try {
    await setupDirectories();
    
    let backupService;
    if (config.databaseType === 'mysql') {
      backupService = new MySQLBackupService();
    } else if (config.databaseType === 'postgresql') {
      backupService = new PostgreSQLBackupService();
    } else {
      throw new Error(`Unsupported database type: ${config.databaseType}`);
    }

    // Schedule weekly PM2 log clearing
    cron.schedule('0 0 * * 0', clearPm2Logs);

    // Schedule backup according to config
    cron.schedule(config.backup.schedule, async () => {
      try {
        await backupService.performBackup();
      } catch (error) {
        logger.error('Scheduled backup failed', { error });
      }
    });

    // Perform initial backup
    await backupService.performBackup();

    logger.info(`${config.databaseType.toUpperCase()} backup service started successfully`);
  } catch (error) {
    logger.error('Failed to start backup service', { error });
    process.exit(1);
  }
}

main(); 