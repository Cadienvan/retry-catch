export type Options = {
  retries: number;
  delay: number;
  backoff: number;
  shouldRetryOnResolve: undefined | ((result: any) => boolean);
  shouldRetryOnReject: undefined | ((err: any) => boolean);
};
