import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

type DatabaseType = 'mysql' | 'postgresql';

interface MySQLConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  useDocker: boolean;
  dockerContainer: string;
  dumpOptions: {
    compress: boolean;
    addDropTable: boolean;
    addLocks: boolean;
    extendedInsert: boolean;
    completeInsert: boolean;
    createOptions: boolean;
    disableKeys: boolean;
    setCharset: boolean;
    delayedInsert: boolean;
    replace: boolean;
    ignoreTable: string;
    additionalOptions: string;
  };
}

interface PostgreSQLConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  useDocker: boolean;
  dockerContainer: string;
  dumpOptions: {
    compress: boolean;
    schemaOnly: boolean;
    dataOnly: boolean;
    noOwner: boolean;
    noPrivileges: boolean;
    noTablespaces: boolean;
    ignoreTable: string;
    additionalOptions: string;
  };
}

interface BackupConfig {
  outputDir: string;
  filenamePrefix: string;
  retentionDays: number;
  schedule: string;
}

interface S3Config {
  enabled: boolean;
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  path: string;
}

interface LoggingConfig {
  level: string;
  dir: string;
  maxFiles: number;
}

interface NotificationConfig {
  enabled: boolean;
  success: boolean;
  error: boolean;
  slack: {
    enabled: boolean;
    webhookUrl: string;
  };
  googleChat: {
    enabled: boolean;
    webhookUrl: string;
    threadKey?: string;
  };
}

interface Config {
  databaseType: DatabaseType;
  mysql: MySQLConfig;
  postgresql: PostgreSQLConfig;
  backup: BackupConfig;
  s3: S3Config;
  logging: LoggingConfig;
  notification: NotificationConfig;
}

const parseBoolean = (value: string): boolean => value.toLowerCase() === 'true';

export const config: Config = {
  databaseType: (process.env.DATABASE_TYPE || 'mysql') as DatabaseType,
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || '',
    useDocker: parseBoolean(process.env.MYSQL_USE_DOCKER || 'false'),
    dockerContainer: process.env.MYSQL_DOCKER_CONTAINER || 'mysql-container',
    dumpOptions: {
      compress: parseBoolean(process.env.MYSQL_DUMP_COMPRESS || 'true'),
      addDropTable: parseBoolean(process.env.MYSQL_DUMP_ADD_DROP_TABLE || 'true'),
      addLocks: parseBoolean(process.env.MYSQL_DUMP_ADD_LOCKS || 'true'),
      extendedInsert: parseBoolean(process.env.MYSQL_DUMP_EXTENDED_INSERT || 'true'),
      completeInsert: parseBoolean(process.env.MYSQL_DUMP_COMPLETE_INSERT || 'false'),
      createOptions: parseBoolean(process.env.MYSQL_DUMP_CREATE_OPTIONS || 'true'),
      disableKeys: parseBoolean(process.env.MYSQL_DUMP_DISABLE_KEYS || 'true'),
      setCharset: parseBoolean(process.env.MYSQL_DUMP_SET_CHARSET || 'true'),
      delayedInsert: parseBoolean(process.env.MYSQL_DUMP_DELAYED_INSERT || 'false'),
      replace: parseBoolean(process.env.MYSQL_DUMP_REPLACE || 'false'),
      ignoreTable: process.env.MYSQL_DUMP_IGNORE_TABLE || '',
      additionalOptions: process.env.MYSQL_DUMP_OPTIONS || '--single-transaction --quick --lock-tables=false'
    }
  },
  postgresql: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '',
    database: process.env.POSTGRES_DATABASE || '',
    useDocker: parseBoolean(process.env.POSTGRES_USE_DOCKER || 'false'),
    dockerContainer: process.env.POSTGRES_DOCKER_CONTAINER || 'postgres-container',
    dumpOptions: {
      compress: parseBoolean(process.env.POSTGRES_DUMP_COMPRESS || 'true'),
      schemaOnly: parseBoolean(process.env.POSTGRES_DUMP_SCHEMA_ONLY || 'false'),
      dataOnly: parseBoolean(process.env.POSTGRES_DUMP_DATA_ONLY || 'false'),
      noOwner: parseBoolean(process.env.POSTGRES_DUMP_NO_OWNER || 'true'),
      noPrivileges: parseBoolean(process.env.POSTGRES_DUMP_NO_PRIVILEGES || 'true'),
      noTablespaces: parseBoolean(process.env.POSTGRES_DUMP_NO_TABLESPACES || 'true'),
      ignoreTable: process.env.POSTGRES_DUMP_IGNORE_TABLE || '',
      additionalOptions: process.env.POSTGRES_DUMP_OPTIONS || '--clean --if-exists'
    }
  },
  backup: {
    outputDir: process.env.BACKUP_OUTPUT_DIR || './backups',
    filenamePrefix: process.env.BACKUP_FILENAME_PREFIX || 'backup',
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '7', 10),
    schedule: process.env.BACKUP_SCHEDULE || '0 0 * * *'
  },
  s3: {
    enabled: parseBoolean(process.env.S3_ENABLED || 'false'),
    bucket: process.env.S3_BUCKET || '',
    region: process.env.S3_REGION || 'us-east-1',
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    path: process.env.S3_PATH || 'backups/'
  },
  logging: {
    dir: process.env.LOG_DIR || './logs',
    level: process.env.LOG_LEVEL || 'info',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '7', 10)
  },
  notification: {
    enabled: parseBoolean(process.env.NOTIFICATION_ENABLED || 'true'),
    success: parseBoolean(process.env.NOTIFICATION_SUCCESS || 'true'),
    error: parseBoolean(process.env.NOTIFICATION_ERROR || 'true'),
    slack: {
      enabled: parseBoolean(process.env.NOTIFICATION_SLACK_ENABLED || 'false'),
      webhookUrl: process.env.NOTIFICATION_SLACK_WEBHOOK_URL || ''
    },
    googleChat: {
      enabled: parseBoolean(process.env.NOTIFICATION_GOOGLE_CHAT_ENABLED || 'false'),
      webhookUrl: process.env.NOTIFICATION_GOOGLE_CHAT_WEBHOOK_URL || '',
      threadKey: process.env.NOTIFICATION_GOOGLE_CHAT_THREAD_KEY
    }
  }
}; 