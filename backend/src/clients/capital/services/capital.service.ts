import axios, { AxiosInstance } from 'axios';
import { CapitalEnvironment } from '@/clients/capital/environments/capital.environment';
import { EncryptionKeyResponseSchema } from '@/clients/capital/schemas/encryption-key.output.schema';
import { AxiosUtil } from '@/utils/axios.util';
import {
  SecurityCredentials,
  SecurityCredentialsSchema,
} from '@/clients/capital/schemas/security-credentials.output.schema';
import {
  HistoricalPricesResponse,
  HistoricalPricesResponseSchema,
} from '@/clients/capital/schemas/price.output.schema';
import {
  MarketDetailsResponse,
  MarketDetailsResponseSchema,
} from '@/clients/capital/schemas/market-details.output.schema';
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
      validateStatus: () => true,
    });

    AxiosUtil.setupErrorInterceptor(this.axiosInstance);
  }

  async createSession(): Promise<SecurityCredentials> {
    try {
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
    } catch (error: unknown) {
      throw AxiosUtil.handleAxiosError(error);
    }
  }

  async closeSession(credentials: SecurityCredentials): Promise<void> {
    try {
      await this.axiosInstance.delete('/api/v1/session', {
        headers: this.getSecurityCredentialsHeaders(credentials),
      });
    } catch (error: unknown) {
      throw AxiosUtil.handleAxiosError(error);
    }
  }

  async getMarketDetails(epic: string, credentials: SecurityCredentials): Promise<MarketDetailsResponse> {
    try {
      const response = await this.axiosInstance.get(`/api/v1/markets/${epic}`, {
        headers: this.getSecurityCredentialsHeaders(credentials),
      });

      return MarketDetailsResponseSchema.parse(response.data);
    } catch (error: unknown) {
      throw AxiosUtil.handleAxiosError(error);
    }
  }

  async getAllPositions(credentials: SecurityCredentials): Promise<PositionsResponse> {
    try {
      const response = await this.axiosInstance.get('/api/v1/positions', {
        headers: this.getSecurityCredentialsHeaders(credentials),
      });

      return PositionsResponseSchema.parse(response.data);
    } catch (error: unknown) {
      throw AxiosUtil.handleAxiosError(error);
    }
  }

  async createPosition(input: CreatePositionInput, credentials: SecurityCredentials): Promise<CreatePositionResponse> {
    const validatedInput = CreatePositionInputSchema.parse(input);

    try {
      const response = await this.axiosInstance.post('/api/v1/positions', validatedInput, {
        headers: this.getSecurityCredentialsHeaders(credentials),
      });

      return CreatePositionResponseSchema.parse(response.data);
    } catch (error: unknown) {
      throw AxiosUtil.handleAxiosError(error);
    }
  }

  async closePosition(dealId: string, credentials: SecurityCredentials): Promise<ClosePositionResponse> {
    try {
      const response = await this.axiosInstance.delete(`/api/v1/positions/${dealId}`, {
        headers: this.getSecurityCredentialsHeaders(credentials),
      });

      return ClosePositionResponseSchema.parse(response.data);
    } catch (error: unknown) {
      throw AxiosUtil.handleAxiosError(error);
    }
  }

  async getHistoricalPrices(
    epic: string,
    resolution: string,
    max: number,
    credentials: SecurityCredentials
  ): Promise<HistoricalPricesResponse> {
    try {
      const response = await this.axiosInstance.get(`/api/v1/prices/${epic}`, {
        params: {
          resolution,
          max,
        },
        headers: this.getSecurityCredentialsHeaders(credentials),
      });

      return HistoricalPricesResponseSchema.parse(response.data);
    } catch (error: unknown) {
      throw AxiosUtil.handleAxiosError(error);
    }
  }

  async getEncryptionKey(): Promise<string> {
    try {
      const response = await this.axiosInstance.get('/api/v1/session/encryptionKey');

      const data = EncryptionKeyResponseSchema.parse(response.data);
      return data.encryptionKey;
    } catch (error: unknown) {
      throw AxiosUtil.handleAxiosError(error);
    }
  }

  private getSecurityCredentialsHeaders(credentials: SecurityCredentials): Record<string, string> {
    return {
      'X-SECURITY-TOKEN': credentials.securityToken,
      CST: credentials.cst,
    };
  }
}
