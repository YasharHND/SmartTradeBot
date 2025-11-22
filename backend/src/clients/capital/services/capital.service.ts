import axios, { AxiosInstance } from 'axios';
import { CapitalEnvironment } from '@/clients/capital/environments/capital.environment';
import { EncryptionKeyResponseSchema } from '@/clients/capital/schemas/encryption-key.output.schema';
import {
  SecurityCredentials,
  SecurityCredentialsSchema,
} from '@/clients/capital/schemas/security-credentials.output.schema';
import {
  HistoricalPricesResponse,
  HistoricalPricesResponseSchema,
} from '@/clients/capital/schemas/price.output.schema';
import { MarketDetailsResponseSchema } from '@/clients/capital/schemas/market-details.output.schema';
import { PositionsResponse, PositionsResponseSchema } from '@/clients/capital/schemas/positions.output.schema';
import { CreatePositionInput, CreatePositionInputSchema } from '@/clients/capital/schemas/create-position.input.schema';
import {
  CreatePositionResponse,
  CreatePositionResponseSchema,
} from '@/clients/capital/schemas/create-position.output.schema';
import {
  ClosePositionResponse,
  ClosePositionResponseSchema,
} from '@/clients/capital/schemas/close-position.output.schema';

export class CapitalService {
  private static _instance: CapitalService;
  private readonly axiosInstance: AxiosInstance;

  public static get instance(): CapitalService {
    if (!CapitalService._instance) {
      const env = CapitalEnvironment.instance;
      CapitalService._instance = new CapitalService(
        env.getCapitalApiUrl(),
        env.getCapitalEmail(),
        env.getCapitalApiKey(),
        env.getCapitalApiKeyCustomPassword()
      );
    }
    return CapitalService._instance;
  }

  private constructor(
    private readonly apiUrl: string,
    private readonly email: string,
    private readonly apiKey: string,
    private readonly apiKeyCustomPassword: string
  ) {
    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'X-CAP-API-KEY': this.apiKey,
      },
    });
  }

  async createSession(): Promise<SecurityCredentials> {
    const response = await this.axiosInstance.post('/api/v1/session', {
      identifier: this.email,
      password: this.apiKeyCustomPassword,
    });

    const securityToken = response.headers['x-security-token'];
    const cst = response.headers['cst'];

    return SecurityCredentialsSchema.parse({
      securityToken,
      cst,
    });
  }

  async closeSession(credentials: SecurityCredentials): Promise<void> {
    await this.axiosInstance.delete('/api/v1/session', {
      headers: this.getSecurityCredentialsHeaders(credentials),
    });
  }

  async isMarketOpen(epic: string, credentials: SecurityCredentials): Promise<boolean> {
    const response = await this.axiosInstance.get(`/api/v1/markets/${epic}`, {
      headers: this.getSecurityCredentialsHeaders(credentials),
    });

    const data = MarketDetailsResponseSchema.parse(response.data);
    return data.snapshot.marketStatus === 'TRADEABLE';
  }

  async getAllPositions(credentials: SecurityCredentials): Promise<PositionsResponse> {
    const response = await this.axiosInstance.get('/api/v1/positions', {
      headers: this.getSecurityCredentialsHeaders(credentials),
    });

    return PositionsResponseSchema.parse(response.data);
  }

  async createPosition(input: CreatePositionInput, credentials: SecurityCredentials): Promise<CreatePositionResponse> {
    const validatedInput = CreatePositionInputSchema.parse(input);

    const response = await this.axiosInstance.post('/api/v1/positions', validatedInput, {
      headers: this.getSecurityCredentialsHeaders(credentials),
    });

    return CreatePositionResponseSchema.parse(response.data);
  }

  async closePosition(dealId: string, credentials: SecurityCredentials): Promise<ClosePositionResponse> {
    const response = await this.axiosInstance.delete(`/api/v1/positions/${dealId}`, {
      headers: this.getSecurityCredentialsHeaders(credentials),
    });

    return ClosePositionResponseSchema.parse(response.data);
  }

  async getHistoricalPrices(
    epic: string,
    resolution: string,
    max: number,
    credentials: SecurityCredentials
  ): Promise<HistoricalPricesResponse> {
    const response = await this.axiosInstance.get(`/api/v1/prices/${epic}`, {
      params: {
        resolution,
        max,
      },
      headers: this.getSecurityCredentialsHeaders(credentials),
    });

    return HistoricalPricesResponseSchema.parse(response.data);
  }

  async getEncryptionKey(): Promise<string> {
    const response = await this.axiosInstance.get('/api/v1/session/encryptionKey');

    const data = EncryptionKeyResponseSchema.parse(response.data);
    return data.encryptionKey;
  }

  private getSecurityCredentialsHeaders(credentials: SecurityCredentials): Record<string, string> {
    return {
      'X-SECURITY-TOKEN': credentials.securityToken,
      CST: credentials.cst,
    };
  }
}
