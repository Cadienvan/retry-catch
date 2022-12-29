import { defaultOptions } from './default';
import { Options } from './models';

export function retryCatch<T>(
  fn: () => Promise<T>,
  _options: Partial<Options>
): Promise<T> {
  const { retries, shouldRetryOnResolve, shouldRetryOnReject, delay, backoff } =
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
            typeof shouldRetryOnResolve === 'function' &&
            shouldRetryOnResolve(result)
          ) {
            internalDelay = handleRetry({
              retriesLeft,
              tryFn,
              internalDelay,
              backoff
            });
          } else if (
            retriesLeft === 1 &&
            typeof shouldRetryOnResolve === 'function' &&
            shouldRetryOnResolve(result)
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
              !shouldRetryOnReject(err))
          ) {
            reject(err);
          } else {
            internalDelay = handleRetry({
              retriesLeft,
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
  tryFn,
  internalDelay,
  backoff
}: {
  retriesLeft: number;
  tryFn: (retriesLeft: number) => void;
  internalDelay: number;
  backoff: number;
}) {
  setTimeout(() => tryFn(retriesLeft - 1), internalDelay);
  internalDelay *= backoff;
  return internalDelay;
}

export function retryCatchable<T>(
  fn: (...args) => Promise<T>,
  _options: Partial<Options>
): (...args) => Promise<T> {
  return (...args) => retryCatch<T>(() => fn(...args), _options);
}
