import axios from 'axios';
import { EnvUtil } from '@common/utils/env.util';

interface EnvironmentVariable {
  key: string;
  value: string | undefined;
  type: string;
  enabled: boolean;
}

interface PostmanEnvironment {
  id?: string;
  uid?: string;
  name: string;
  values: EnvironmentVariable[];
  workspace?: string;
}

export class PostmanUtil {
  private constructor() {}

  private static readonly POSTMAN_API_URL = 'https://api.getpostman.com/environments';
  private static readonly POSTMAN_API_KEY = EnvUtil.getRequiredEnv('POSTMAN_API_KEY');
  private static readonly POSTMAN_WORKSPACE_ID = EnvUtil.getRequiredEnv('POSTMAN_WORKSPACE_ID');

  private static async fetchPostmanEnvironment(name: string): Promise<PostmanEnvironment | undefined> {
    const response = await axios.get(`${this.POSTMAN_API_URL}?workspace=${this.POSTMAN_WORKSPACE_ID}`, {
      headers: { 'X-Api-Key': this.POSTMAN_API_KEY },
    });
    const { environments } = response.data as { environments: PostmanEnvironment[] };
    return environments.find((env) => env.name === name);
  }

  static async createOrUpdatePostmanEnvironment(environment: PostmanEnvironment): Promise<void> {
    try {
      const existingEnvironment = await this.fetchPostmanEnvironment(environment.name);
      const method = existingEnvironment ? 'put' : 'post';
      const url = existingEnvironment ? `${this.POSTMAN_API_URL}/${existingEnvironment.uid}` : this.POSTMAN_API_URL;

      const updatedEnvironment = { ...environment, workspace: this.POSTMAN_WORKSPACE_ID };
      await axios[method](
        url,
        { environment: updatedEnvironment },
        {
          headers: {
            'X-Api-Key': this.POSTMAN_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(
        `Postman environment '${environment.name}' ${existingEnvironment ? 'updated' : 'created'} successfully.`
      );
    } catch (error) {
      console.error(`Error fetching or updating Postman environment '${environment.name}':`, error);
    }
  }

  static async removePostmanEnvironment(name: string): Promise<void> {
    let environment;
    try {
      environment = await this.fetchPostmanEnvironment(name);
    } catch (error) {
      console.error(`Error fetching Postman environment '${name}':`, error);
      return;
    }
    if (environment) {
      try {
        await axios.delete(`${this.POSTMAN_API_URL}/${environment.uid}`, {
          headers: { 'X-Api-Key': this.POSTMAN_API_KEY },
          params: { workspace: this.POSTMAN_WORKSPACE_ID },
        });
        console.log(`Postman environment '${name}' deleted successfully.`);
      } catch (error) {
        console.error(`Error deleting Postman environment '${name}':`, error);
      }
    } else {
      console.log(`No Postman environment found for: '${name}'.`);
    }
  }
}
