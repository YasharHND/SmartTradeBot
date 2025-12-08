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

  async sendPositionActionNotification(
    action: 'OPEN' | 'CLOSE',
    symbol: string,
    direction: 'BUY' | 'SELL',
    price: number,
    size: number,
    fundamentalReason?: string,
    decisionReason?: string
  ): Promise<void> {
    const subject = `${action} Position: ${symbol} - ${direction}`;
    const htmlBody = this.convertPositionActionToHtml(
      action,
      symbol,
      direction,
      price,
      size,
      fundamentalReason,
      decisionReason
    );
    return this.sesService.sendEmail({
      to: [this.defaultDestination],
      subject,
      htmlBody,
    });
  }

  async sendErrorNotification(subject: string, error: Error, errorId: string): Promise<void> {
    const htmlBody = this.convertErrorToHtml(error, errorId);
    return this.sesService.sendEmail({
      to: [this.defaultDestination],
      subject,
      htmlBody,
    });
  }

  private convertPositionActionToHtml(
    action: 'OPEN' | 'CLOSE',
    symbol: string,
    direction: 'BUY' | 'SELL',
    price: number,
    size: number,
    fundamentalReason?: string,
    decisionReason?: string
  ): string {
    const timestamp = new Date().toISOString();
    const actionColor = action === 'OPEN' ? '#16a34a' : '#dc2626';
    const directionColor = direction === 'BUY' ? '#2563eb' : '#ea580c';

    const reasoningSection =
      fundamentalReason || decisionReason
        ? `
              <div style="margin-top: 30px; padding-top: 30px; border-top: 2px solid #e5e7eb;">
                <h2 style="color: #111827; font-size: 20px; margin-bottom: 20px; text-align: center;">📈 Analysis</h2>
                
                ${
                  fundamentalReason
                    ? `
                <div class="reason-box">
                  <div class="reason-label">📰 Fundamental Analysis</div>
                  <div class="reason-text">${fundamentalReason}</div>
                </div>
                `
                    : ''
                }
                
                ${
                  decisionReason
                    ? `
                <div class="reason-box">
                  <div class="reason-label">🎯 Final Decision</div>
                  <div class="reason-text">${decisionReason}</div>
                </div>
                `
                    : ''
                }
              </div>
            `
        : '';

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
              background: linear-gradient(135deg, ${actionColor} 0%, ${actionColor}dd 100%);
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
            .detail-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
            }
            .detail-table td {
              padding: 15px;
              background-color: #eff6ff;
              border-left: 4px solid #3b82f6;
            }
            .detail-label {
              font-weight: 600;
              color: #6b7280;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .detail-value {
              font-weight: 600;
              font-size: 16px;
              color: #111827;
              text-align: right;
            }
            .action-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              background-color: ${actionColor};
              color: #ffffff;
              font-weight: 600;
              font-size: 14px;
              margin-bottom: 20px;
            }
            .direction-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              background-color: ${directionColor};
              color: #ffffff;
              font-weight: 600;
              font-size: 14px;
            }
            .timestamp {
              color: #6b7280;
              font-size: 13px;
              text-align: center;
              padding: 20px;
              border-top: 1px solid #e5e7eb;
            }
            .symbol {
              font-size: 24px;
              font-weight: 700;
              color: #111827;
              text-align: center;
              margin: 20px 0;
            }
            .reason-box {
              margin-bottom: 20px;
              background-color: #f9fafb;
              border-radius: 8px;
              padding: 20px;
              border-left: 4px solid #8b5cf6;
            }
            .reason-label {
              font-weight: 700;
              color: #6b21a8;
              font-size: 16px;
              margin-bottom: 12px;
            }
            .reason-text {
              color: #374151;
              font-size: 15px;
              line-height: 1.7;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Position ${action === 'OPEN' ? 'Opened' : 'Closed'}</h1>
            </div>
            <div class="content">
              <div style="text-align: center;">
                <span class="action-badge">${action}</span>
                <span class="direction-badge">${direction}</span>
              </div>
              
              <div class="symbol">${symbol}</div>
              
              <table class="detail-table" style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                <tr>
                  <td class="detail-label" style="padding: 15px; background-color: #eff6ff; border-left: 4px solid #3b82f6; font-weight: 600; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Price</td>
                  <td class="detail-value" style="padding: 15px; background-color: #eff6ff; font-weight: 600; font-size: 16px; color: #111827; text-align: right;">${price}</td>
                </tr>
              </table>
              
              <table class="detail-table" style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                <tr>
                  <td class="detail-label" style="padding: 15px; background-color: #eff6ff; border-left: 4px solid #3b82f6; font-weight: 600; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Size</td>
                  <td class="detail-value" style="padding: 15px; background-color: #eff6ff; font-weight: 600; font-size: 16px; color: #111827; text-align: right;">${size}</td>
                </tr>
              </table>
              
              ${reasoningSection}
            </div>
            <div class="timestamp">
              Timestamp: ${timestamp}
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private convertErrorToHtml(error: Error, errorId: string): string {
    const timestamp = new Date().toISOString();
    const stackTrace = error.stack?.replace(/\n/g, '<br>') || 'No stack trace available';
    const formattedMessage = this.formatErrorMessage(error.message);

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
            .error-id-box {
              background-color: #f0fdf4;
              border: 2px solid #16a34a;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 25px;
              text-align: center;
            }
            .error-id-label {
              font-weight: 600;
              color: #15803d;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 10px;
            }
            .error-id-value {
              background-color: #ffffff;
              border: 1px solid #86efac;
              padding: 12px 20px;
              border-radius: 6px;
              font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
              font-size: 16px;
              font-weight: 600;
              color: #166534;
              user-select: all;
              cursor: text;
              word-break: break-all;
            }
            .error-id-hint {
              font-size: 11px;
              color: #15803d;
              margin-top: 8px;
              font-style: italic;
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
              
              <div class="error-id-box">
                <div class="error-id-label">Error Reference ID</div>
                <div class="error-id-value">${errorId}</div>
                <div class="error-id-hint">Click to select and copy for CloudWatch logs</div>
              </div>
              
              <div class="error-section">
                <div class="error-label">Error Name</div>
                <div class="error-value">${error.name}</div>
              </div>
              
              <div class="error-section">
                <div class="error-label">Error Message</div>
                <div class="error-value">${formattedMessage}</div>
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

  private formatErrorMessage(message: string): string {
    try {
      const parsed = JSON.parse(message);
      return `<pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">${JSON.stringify(parsed, null, 2)}</pre>`;
    } catch {
      return message;
    }
  }
}
