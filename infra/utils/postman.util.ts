import axios from 'axios';
import { getInfraLogger } from './logger.util';

const POSTMAN_API_URL = 'https://api.getpostman.com/environments';
const POSTMAN_API_KEY = process.env.POSTMAN_API_KEY;
const POSTMAN_WORKSPACE_ID = process.env.POSTMAN_WORKSPACE_ID;
/**
 * Represents a variable within a Postman environment.
 */
interface EnvironmentVariable {
  key: string;
  value: string | undefined;
  type: string;
  enabled: boolean;
}

/**
 * Represents a Postman environment.
 */
interface PostmanEnvironment {
  id?: string;
  uid?: string;
  name: string;
  values: EnvironmentVariable[];
  workspace?: string;
}

const logger = getInfraLogger('postman-environment-manager');

/**
 * Fetches a Postman environment by name.
 * @param {string} name - The name of the Postman environment to fetch.
 * @returns {Promise<PostmanEnvironment | undefined>} The fetched Postman environment or undefined if not found.
 */
async function fetchPostmanEnvironment(name: string): Promise<PostmanEnvironment | undefined> {
  const response = await axios.get(`${POSTMAN_API_URL}?workspace=${POSTMAN_WORKSPACE_ID}`, {
    headers: { 'X-Api-Key': POSTMAN_API_KEY },
  });
  const { environments } = response.data as { environments: PostmanEnvironment[] };
  return environments.find((env) => env.name === name);
}

/**
 * Creates or updates a Postman environment.
 * @param {PostmanEnvironment} environment - The Postman environment to create or update.
 * @returns {Promise<void>}
 */
async function createOrUpdatePostmanEnvironment(environment: PostmanEnvironment): Promise<void> {
  if (!POSTMAN_API_KEY || !POSTMAN_WORKSPACE_ID) {
    logger.error('POSTMAN_API_KEY or POSTMAN_WORKSPACE_ID is not set.');
    return;
  }

  try {
    const existingEnvironment = await fetchPostmanEnvironment(environment.name);
    const method = existingEnvironment ? 'put' : 'post';
    const url = existingEnvironment ? `${POSTMAN_API_URL}/${existingEnvironment.uid}` : POSTMAN_API_URL;

    const updatedEnvironment = { ...environment, workspace: POSTMAN_WORKSPACE_ID };
    await axios[method](
      url,
      { environment: updatedEnvironment },
      {
        headers: {
          'X-Api-Key': POSTMAN_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    logger.info(
      `Postman environment '${environment.name}' ${existingEnvironment ? 'updated' : 'created'} successfully.`
    );
  } catch (error) {
    logger.error(`Error fetching or updating Postman environment '${environment.name}':`, { error });
  }
}

/**
 * Removes a Postman environment by name.
 * @param {string} name - The name of the Postman environment to remove.
 * @returns {Promise<void>}
 */
async function removePostmanEnvironment(name: string): Promise<void> {
  if (!POSTMAN_API_KEY || !POSTMAN_WORKSPACE_ID) {
    logger.error('POSTMAN_API_KEY or POSTMAN_WORKSPACE_ID is not set.');
    return;
  }
  let environment;
  try {
    environment = await fetchPostmanEnvironment(name);
  } catch (error) {
    logger.error(`Error fetching Postman environment '${name}':`, { error });
    return;
  }
  if (environment) {
    try {
      await axios.delete(`${POSTMAN_API_URL}/${environment.uid}`, {
        headers: { 'X-Api-Key': POSTMAN_API_KEY },
        params: { workspace: POSTMAN_WORKSPACE_ID },
      });
      logger.info(`Postman environment '${name}' deleted successfully.`);
    } catch (error) {
      logger.error(`Error deleting Postman environment '${name}':`, { error });
    }
  } else {
    logger.info(`No Postman environment found for: '${name}'.`);
  }
}

export { createOrUpdatePostmanEnvironment, removePostmanEnvironment };
