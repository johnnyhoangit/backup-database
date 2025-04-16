# Database Backup Service

A TypeScript-based service that performs MySQL and PostgreSQL database backups and optionally uploads them to AWS S3.

## Features

- Support for both MySQL and PostgreSQL databases
- Database backup using mysqldump/pg_dump with extensive configuration options
- Support for both local and Docker-based database instances
- Optional S3 upload capability
- Automated scheduling using cron
- PM2 process management with weekly log rotation
- Configurable backup retention
- Comprehensive logging
- Success and error notifications via Slack and Google Chat

## Prerequisites

- Node.js (v14 or higher)
- MySQL or PostgreSQL server (local or Docker)
- AWS credentials (if using S3)
- PM2 (for process management)
- Slack or Google Chat webhook URL (if using notifications)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the service by copying `.env.example` to `.env` and updating the values

## Configuration

All configuration is done through environment variables in the `.env` file:

### Database Type Configuration
- `DATABASE_TYPE`: Type of database to backup (mysql or postgresql)

### MySQL Configuration
- `MYSQL_HOST`: MySQL host (default: localhost)
- `MYSQL_PORT`: MySQL port (default: 3306)
- `MYSQL_USER`: MySQL username (default: root)
- `MYSQL_PASSWORD`: MySQL password
- `MYSQL_DATABASE`: Database name to backup
- `MYSQL_USE_DOCKER`: Use Docker for backup (default: false)
- `MYSQL_DOCKER_CONTAINER`: Docker container name (default: mysql-container)

### MySQL Dump Options
- `MYSQL_DUMP_OPTIONS`: Additional mysqldump options
- `MYSQL_DUMP_COMPRESS`: Enable compression (default: true)
- `MYSQL_DUMP_ADD_DROP_TABLE`: Add DROP TABLE statements (default: true)
- `MYSQL_DUMP_ADD_LOCKS`: Add table locks (default: true)
- `MYSQL_DUMP_EXTENDED_INSERT`: Use extended INSERT syntax (default: true)
- `MYSQL_DUMP_COMPLETE_INSERT`: Use complete INSERT statements (default: false)
- `MYSQL_DUMP_CREATE_OPTIONS`: Add MySQL-specific table options (default: true)
- `MYSQL_DUMP_DISABLE_KEYS`: Disable keys during dump (default: true)
- `MYSQL_DUMP_SET_CHARSET`: Add SET NAMES charset_name (default: true)
- `MYSQL_DUMP_DELAYED_INSERT`: Use INSERT DELAYED (default: false)
- `MYSQL_DUMP_REPLACE`: Use REPLACE instead of INSERT (default: false)
- `MYSQL_DUMP_IGNORE_TABLE`: Tables to ignore during backup

### PostgreSQL Configuration
- `POSTGRES_HOST`: PostgreSQL host (default: localhost)
- `POSTGRES_PORT`: PostgreSQL port (default: 5432)
- `POSTGRES_USER`: PostgreSQL username (default: postgres)
- `POSTGRES_PASSWORD`: PostgreSQL password
- `POSTGRES_DATABASE`: Database name to backup
- `POSTGRES_USE_DOCKER`: Use Docker for backup (default: false)
- `POSTGRES_DOCKER_CONTAINER`: Docker container name (default: postgres-container)

### PostgreSQL Dump Options
- `POSTGRES_DUMP_OPTIONS`: Additional pg_dump options
- `POSTGRES_DUMP_COMPRESS`: Enable compression (default: true)
- `POSTGRES_DUMP_SCHEMA_ONLY`: Dump only schema (default: false)
- `POSTGRES_DUMP_DATA_ONLY`: Dump only data (default: false)
- `POSTGRES_DUMP_NO_OWNER`: Do not output commands to set ownership (default: true)
- `POSTGRES_DUMP_NO_PRIVILEGES`: Do not output commands to set privileges (default: true)
- `POSTGRES_DUMP_NO_TABLESPACES`: Do not output commands to select tablespaces (default: true)
- `POSTGRES_DUMP_IGNORE_TABLE`: Tables to exclude from backup

### Backup Configuration
- `BACKUP_OUTPUT_DIR`: Output directory for backups (default: ./backups)
- `BACKUP_FILENAME_PREFIX`: Prefix for backup files (default: backup)
- `BACKUP_RETENTION_DAYS`: Number of days to keep backups (default: 7)
- `BACKUP_SCHEDULE`: Cron schedule for backups (default: 0 0 * * *)

### S3 Configuration
- `S3_ENABLED`: Enable S3 upload (default: false)
- `S3_BUCKET`: S3 bucket name
- `S3_REGION`: AWS region (default: us-east-1)
- `S3_ACCESS_KEY_ID`: AWS access key
- `S3_SECRET_ACCESS_KEY`: AWS secret key
- `S3_PATH`: Path in S3 bucket (default: backups/)

### Logging Configuration
- `LOG_LEVEL`: Log level (default: info)
- `LOG_DIR`: Log directory (default: ./logs)
- `LOG_MAX_FILES`: Maximum number of log files to keep (default: 7)

### Notification Configuration
- `NOTIFICATION_ENABLED`: Enable notifications (default: true)
- `NOTIFICATION_SUCCESS`: Send success notifications (default: true)
- `NOTIFICATION_ERROR`: Send error notifications (default: true)
- `NOTIFICATION_SLACK_ENABLED`: Enable Slack notifications (default: false)
- `NOTIFICATION_SLACK_WEBHOOK_URL`: Slack webhook URL
- `NOTIFICATION_GOOGLE_CHAT_ENABLED`: Enable Google Chat notifications (default: false)
- `NOTIFICATION_GOOGLE_CHAT_WEBHOOK_URL`: Google Chat webhook URL
- `NOTIFICATION_GOOGLE_CHAT_THREAD_KEY`: Optional thread key for Google Chat messages

## Usage

### Development

```bash
npm run dev
```

### Production

1. Build the application:
   ```bash
   npm run build
   ```

2. Start with PM2:
   ```bash
   npm start
   ```

## PM2 Commands

- View logs: `pm2 logs`
- Monitor: `pm2 monit`
- Stop service: `pm2 stop mysql-backup`
- Restart service: `pm2 restart mysql-backup`

## Logs

Logs are stored in the configured directory (default: `./logs`) and are rotated daily. PM2 logs are automatically cleared weekly.

## Notifications

The service can send notifications to both Slack and Google Chat when:
- A backup completes successfully
- A backup fails

Notifications include:
- Backup status (success/failure)
- Database name and type
- Backup file path (on success)
- Error details (on failure)

### Setting up Slack Notifications

1. Create a Slack webhook:
   - Go to your Slack workspace settings
   - Navigate to "Incoming Webhooks"
   - Create a new webhook
   - Copy the webhook URL

2. Configure in `.env`:
   ```
   NOTIFICATION_SLACK_ENABLED=true
   NOTIFICATION_SLACK_WEBHOOK_URL=your_webhook_url
   ```

### Setting up Google Chat Notifications

1. Create a Google Chat webhook:
   - Go to Google Chat
   - Create a new space or use an existing one
   - Add a webhook
   - Copy the webhook URL

2. Configure in `.env`:
   ```
   NOTIFICATION_GOOGLE_CHAT_ENABLED=true
   NOTIFICATION_GOOGLE_CHAT_WEBHOOK_URL=your_webhook_url
   ```

## License

MIT 