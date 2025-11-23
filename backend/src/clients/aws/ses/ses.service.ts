import { SESClient, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-ses';
import { LogUtil, Logger } from '@utils/log.util';
import { SESEnvironment } from '@clients/aws/ses/ses.environment';
import { SesSendMailInput } from '@/clients/aws/ses/ses-send-mail.input.schema';

export class SESService {
  private static _instance: SESService;

  public static get instance(): SESService {
    if (!SESService._instance) {
      const environment = SESEnvironment.instance;
      SESService._instance = new SESService(environment.getAwsRegion(), environment.getAwsSesSource());
    }
    return SESService._instance;
  }

  private readonly client: SESClient;

  private constructor(
    region: string,
    private readonly source: string,
    private readonly logger: Logger = LogUtil.getLogger(SESService.name)
  ) {
    this.client = new SESClient({ region });
  }

  async sendEmail(params: SesSendMailInput): Promise<void> {
    const { to, subject, htmlBody } = params;

    const emailParams: SendEmailCommandInput = {
      Source: this.source,
      Destination: {
        ToAddresses: to,
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8',
          },
        },
      },
    };

    const command = new SendEmailCommand(emailParams);
    await this.client.send(command);

    this.logger.info('SES :: Email sent successfully', {
      to,
      subject,
    });
  }
}
