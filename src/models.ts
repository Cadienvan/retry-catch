export type Options = {
  retries: number;
  delay: number;
  backoff: number;
  shouldRetryOnFulfill: undefined | ((result: any) => boolean);
  shouldRetryOnReject: undefined | ((err: any) => boolean);
};
