import { SESService } from '@/clients/aws/ses/ses.service';
import { RuntimeEnvironment } from '@common/environments/runtime.environment';

export class EmailService {
  private static _instance: EmailService;

  public static get instance(): EmailService {
    if (!EmailService._instance) {
      EmailService._instance = new EmailService();
    }
    return EmailService._instance;
  }

  private constructor(
    private readonly sesService: SESService = SESService.instance,
    private readonly defaultDestination: string = RuntimeEnvironment.instance.getDefaultEmailNotificationDestination()
  ) {}

  async sendErrorNotification(subject: string, error: Error): Promise<void> {
    const htmlBody = this.convertErrorToHtml(error);
    return this.sesService.sendEmail({
      to: [this.defaultDestination],
      subject,
      htmlBody,
    });
  }

  private convertErrorToHtml(error: Error): string {
    const timestamp = new Date().toISOString();
    const stackTrace = error.stack?.replace(/\n/g, '<br>') || 'No stack trace available';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
              color: #ffffff;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .content {
              padding: 30px;
            }
            .error-section {
              margin-bottom: 25px;
            }
            .error-label {
              font-weight: 600;
              color: #dc2626;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
            }
            .error-value {
              background-color: #fef2f2;
              border-left: 4px solid #dc2626;
              padding: 15px;
              border-radius: 4px;
              font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
              font-size: 14px;
              word-break: break-word;
              color: #991b1b;
            }
            .stack-trace {
              background-color: #1f2937;
              color: #f3f4f6;
              padding: 20px;
              border-radius: 4px;
              font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.5;
              overflow-x: auto;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            .timestamp {
              color: #6b7280;
              font-size: 13px;
              text-align: center;
              padding: 20px;
              border-top: 1px solid #e5e7eb;
            }
            .info-box {
              background-color: #eff6ff;
              border-left: 4px solid #3b82f6;
              padding: 15px;
              border-radius: 4px;
              margin-bottom: 25px;
            }
            .info-box p {
              margin: 0;
              color: #1e40af;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Error Notification</h1>
            </div>
            <div class="content">
              <div class="info-box">
                <p><strong>An error has occurred in SmartTradeBot</strong></p>
              </div>
              
              <div class="error-section">
                <div class="error-label">Error Name</div>
                <div class="error-value">${error.name}</div>
              </div>
              
              <div class="error-section">
                <div class="error-label">Error Message</div>
                <div class="error-value">${error.message}</div>
              </div>
              
              <div class="error-section">
                <div class="error-label">Stack Trace</div>
                <div class="stack-trace">${stackTrace}</div>
              </div>
            </div>
            <div class="timestamp">
              Timestamp: ${timestamp}
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
