import { test, describe } from 'node:test';
import assert from 'node:assert';
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
  test('should return the same value as the function', async () => {
    const result = await retryCatch(() => fnWithCanceOfFailing(0), {});
    assert.strictEqual(result, 'OK');
  });

  test('should retry 4 times at most', async () => {
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
      assert.strictEqual(executionCount, 4);
    }
  });

  test('should not retry if shouldRetryOnReject is false', async () => {
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
      assert.strictEqual(executionCount, 1);
    }
  });

  test('should retry if shouldRetryOnReject is true', async () => {
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
      assert.strictEqual(executionCount, 4);
    }
  });

  test('should not retry if shouldRetryOnResolve is false', async () => {
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
      assert.strictEqual(executionCount, 1);
    }
  });

  test('should retry if shouldRetryOnResolve is true', async () => {
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
      assert.strictEqual(executionCount, 4);
    }
  });
});

describe('retryCatchable', () => {
  test('should return a function without executing it', async () => {
    const fn = retryCatchable(fnWithCanceOfFailing, {});
    assert(typeof fn === 'function');
  });

  test('should return the same value as the function', async () => {
    const fn = retryCatchable(fnWithCanceOfFailing, {});
    const result = await fn(0);
    try {
      await fn(1);
    } catch (e) {
      assert.strictEqual(e, 'KO');
    }
    assert.strictEqual(result, 'OK');
  });
});
