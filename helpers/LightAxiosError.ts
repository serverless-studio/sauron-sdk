import { AxiosError } from 'axios';

interface AxiosResponseData {
  message: string;
  [key: string]: unknown;
}

/**
 * We prevent logging the potentially sensitive data by catching the Axios errors and
 * rethrowing only the response error.
 *
 * Standard AxiosErrors show the request data which includes secret keys as well as sensitive
 * customer data.
 */
export class LightAxiosError extends Error {
  constructor(axiosError: AxiosError) {
    const errorAttributes = axiosError.response.data as AxiosResponseData[];

    super(JSON.stringify({
      error: errorAttributes,
      statusCode: axiosError.response.status,
    }));

    this.name = 'LightAxiosError';
  }
}
