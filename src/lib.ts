import { defaultOptions } from './default';
import { Options } from './models';

export function retryCatch(
  fn: () => Promise<any>,
  _options: Partial<Options>
): Promise<any> {
  const { retries, shouldRetryOnFulfill, shouldRetryOnReject, delay, backoff } =
    {
      ...defaultOptions,
      ..._options
    };
  let internalDelay = delay;
  return new Promise((resolve, reject) => {
    const tryFn = (retriesLeft: number) => {
      fn()
        .then((result) => {
          if (
            retriesLeft > 1 &&
            typeof shouldRetryOnFulfill === 'function' &&
            shouldRetryOnFulfill(result)
          ) {
            internalDelay = handleRetry({
              retriesLeft,
              reject,
              result,
              tryFn,
              internalDelay,
              backoff
            });
          } else if (
            retriesLeft === 1 &&
            typeof shouldRetryOnFulfill === 'function' &&
            shouldRetryOnFulfill(result)
          ) {
            reject(result);
          } else {
            resolve(result);
          }
        })
        .catch((err) => {
          if (
            retriesLeft === 1 ||
            (typeof shouldRetryOnReject === 'function' &&
              shouldRetryOnReject(err))
          ) {
            reject(err);
          } else {
            internalDelay = handleRetry({
              retriesLeft,
              reject,
              result: err,
              tryFn,
              internalDelay,
              backoff
            });
          }
        });
    };
    tryFn(retries);
  });
}

function handleRetry({
  retriesLeft,
  reject,
  result,
  tryFn,
  internalDelay,
  backoff
}: {
  retriesLeft: number;
  reject: (reason?: any) => void;
  result: any;
  tryFn: (retriesLeft: number) => void;
  internalDelay: number;
  backoff: number;
}) {
  if (retriesLeft === 1) {
    reject(result);
  } else {
    setTimeout(() => tryFn(retriesLeft - 1), internalDelay);
    internalDelay *= backoff;
  }
  return internalDelay;
}
