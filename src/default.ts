import { Options } from './models';

export const defaultOptions: Options = {
  retries: 3,
  delay: 1000,
  backoff: 1,
  shouldRetryOnResolve: undefined,
  shouldRetryOnReject: undefined
};
