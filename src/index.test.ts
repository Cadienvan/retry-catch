import { retryCatch, retryCatchable } from './index';

const fnWithCanceOfFailing = (chanceOfFailing = 0.8) => {
  return new Promise((resolve, reject) => {
    if (Math.random() < chanceOfFailing) {
      reject('KO');
      return;
    }
    resolve('OK');
  });
};

describe('retryCatch', () => {
  it('should return the same value as the function', async () => {
    const result = await retryCatch(() => fnWithCanceOfFailing(0), {});
    expect(result).toBe('OK');
  });

  it('should retry 4 times at most', async () => {
    let executionCount = 0;
    try {
      await retryCatch(
        () => {
          executionCount++;
          return fnWithCanceOfFailing(1);
        },
        {
          retries: 4,
          delay: 10,
          backoff: 1
        }
      );
    } catch (e) {
      expect(executionCount).toBe(4);
    }
    // await new Promise((resolve) => setTimeout(resolve, 900));
  });

  it('should not retry if shouldRetryOnReject is false', async () => {
    let executionCount = 0;
    try {
      await retryCatch(
        () => {
          executionCount++;
          return fnWithCanceOfFailing(1);
        },
        {
          retries: 4,
          delay: 10,
          backoff: 1,
          shouldRetryOnReject: () => false
        }
      );
    } catch (e) {
      expect(executionCount).toBe(1);
    }
  });

  it('should retry if shouldRetryOnReject is true', async () => {
    let executionCount = 0;
    try {
      await retryCatch(
        () => {
          executionCount++;
          return fnWithCanceOfFailing(1);
        },
        {
          retries: 4,
          delay: 10,
          backoff: 1,
          shouldRetryOnReject: () => true
        }
      );
    } catch (e) {
      expect(executionCount).toBe(4);
    }
  });

  it('should not retry if shouldRetryOnResolve is false', async () => {
    let executionCount = 0;
    try {
      await retryCatch(
        () => {
          executionCount++;
          return fnWithCanceOfFailing(0);
        },
        {
          retries: 4,
          delay: 10,
          backoff: 1,
          shouldRetryOnResolve: () => false
        }
      );
    } catch (e) {
      expect(executionCount).toBe(1);
    }
  });

  it('should retry if shouldRetryOnResolve is true', async () => {
    let executionCount = 0;
    try {
      await retryCatch(
        () => {
          executionCount++;
          return fnWithCanceOfFailing(0);
        },
        {
          retries: 4,
          delay: 10,
          backoff: 1,
          shouldRetryOnResolve: () => true
        }
      );
    } catch (e) {
      expect(executionCount).toBe(4);
    }
  });
});

describe('retryCatchable', () => {
  it('should return a function without executing it', async () => {
    const fn = retryCatchable(fnWithCanceOfFailing, {});
    expect(fn).toBeInstanceOf(Function);
  });

  it('should return the same value as the function', async () => {
    const fn = retryCatchable(fnWithCanceOfFailing, {});
    const result = await fn(0);
    try {
      await fn(1);
    } catch (e) {
      expect(e).toBe('KO');
    }
    expect(result).toBe('OK');
  });
});
