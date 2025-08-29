import axios from 'axios';

const POSTMAN_API_URL = 'https://api.getpostman.com/environments';

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

export class PostmanService {
  constructor(
    private readonly apiKey: string,
    private readonly workspaceId: string
  ) {}

  async createOrUpdatePostmanEnvironment(environment: PostmanEnvironment): Promise<void> {
    const existingEnvironment = await this.fetchPostmanEnvironment(environment.name);
    const method = existingEnvironment ? 'put' : 'post';
    const url = existingEnvironment ? `${POSTMAN_API_URL}/${existingEnvironment.uid}` : POSTMAN_API_URL;

    const updatedEnvironment = { ...environment, workspace: this.workspaceId };
    await axios[method](
      url,
      { environment: updatedEnvironment },
      {
        headers: {
          'X-Api-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  async removePostmanEnvironment(name: string): Promise<void> {
    const environment = await this.fetchPostmanEnvironment(name);

    if (environment) {
      await axios.delete(`${POSTMAN_API_URL}/${environment.uid}`, {
        headers: { 'X-Api-Key': this.apiKey },
        params: { workspace: this.workspaceId },
      });
    }
  }

  private async fetchPostmanEnvironment(name: string): Promise<PostmanEnvironment | undefined> {
    const response = await axios.get(`${POSTMAN_API_URL}?workspace=${this.workspaceId}`, {
      headers: { 'X-Api-Key': this.apiKey },
    });
    const { environments } = response.data as { environments: PostmanEnvironment[] };
    return environments.find((env) => env.name === name);
  }
}
