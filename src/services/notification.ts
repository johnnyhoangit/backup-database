import axios from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';

interface NotificationMessage {
  title: string;
  message: string;
  error?: Error;
  backupPath?: string;
}

export class NotificationService {
  public async sendNotification(message: NotificationMessage): Promise<void> {
    if (!config.notification.enabled) {
      return;
    }

    if (message.error && !config.notification.error) {
      return;
    }

    if (!message.error && !config.notification.success) {
      return;
    }

    try {
      if (config.notification.slack.enabled) {
        await this.sendSlackNotification(message);
      }

      if (config.notification.googleChat.enabled) {
        await this.sendGoogleChatNotification(message);
      }
    } catch (error) {
      logger.error('Failed to send notification', { error });
    }
  }

  private async sendSlackNotification(message: NotificationMessage): Promise<void> {
    const { webhookUrl } = config.notification.slack;
    if (!webhookUrl) {
      logger.warn('Slack webhook URL not configured');
      return;
    }

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: message.title,
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message.message
        }
      }
    ];

    if (message.error) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Error:*\n\`\`\`${message.error.message}\`\`\``
        }
      });
    }

    if (message.backupPath) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Backup Path:*\n${message.backupPath}`
        }
      });
    }

    await axios.post(webhookUrl, {
      blocks,
      text: message.title
    });
  }

  private async sendGoogleChatNotification(message: NotificationMessage): Promise<void> {
    const { webhookUrl, threadKey } = config.notification.googleChat;
    if (!webhookUrl) {
      logger.warn('Google Chat webhook URL not configured');
      return;
    }

    const cards = [
      {
        header: {
          title: message.title
        },
        sections: [
          {
            widgets: [
              {
                textParagraph: {
                  text: message.message
                }
              }
            ]
          }
        ]
      }
    ];

    if (message.error) {
      cards[0].sections.push({
        widgets: [
          {
            textParagraph: {
              text: `<b>Error:</b>\n<pre>${message.error.message}</pre>`
            }
          }
        ]
      });
    }

    if (message.backupPath) {
      cards[0].sections.push({
        widgets: [
          {
            textParagraph: {
              text: `<b>Backup Path:</b>\n${message.backupPath}`
            }
          }
        ]
      });
    }

    const payload: any = {
      cards
    };

    if (threadKey) {
      payload.thread = {
        name: threadKey
      };
    }

    await axios.post(webhookUrl, payload);
  }
} 