# What is this?

A simple higher-order function allowing execution to be repeated until a condition is satisfied or a limit is reached.

# How do I install it?

```bash
npm install retry-catch
```

# How can I use it?

## Basic usage

```js
const {retryCatchable} = require('retry-catch');

const fnWithChanceOfFailing = (chanceOfFailing = 0.8) => {
  return new Promise((resolve, reject) => {
    if (Math.random() < chanceOfFailing) {
      reject('KO');
      return;
    }
    resolve('OK');
  });
};

const retryFn = retryCatchable(fnWithChanceOfFailing, {
  retries: 5,
  delay: 1000,
  backoff: 2,
});

retryFn(0.8)
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.log(error);
  });
```

The function will randomly fail 80% of the time. The retry function will retry the function 5 times, with a delay of 1 second between each retry. The delay will be multiplied by 2 after each retry.  
The function will resolve with the result of the function if it succeeds, or reject with the error if it fails after all retries.
## Advanced usage - shouldRetryOnReject

You can also retry on reject, if you want to retry only if a specific error is returned.

```js
const {retryCatchable} = require('retry-catch');

const fnWithChanceOfFailing = (chanceOfFailing = 0.8) => {
  return new Promise((resolve, reject) => {
    if (Math.random() < chanceOfFailing) {
      reject(Math.random() < 0.8 ? 'KO' : 'REAL-KO');
      return;
    }
    resolve('OK');
  });
};

const retryFn = retryCatchable(fnWithChanceOfFailing, {
  retries: 5,
  delay: 1000,
  backoff: 2,
  shouldRetryOnReject: (error) => {
    return error === 'KO';
  },
});

retryFn(0.8)
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.log(error);
  });
```

The function will randomly fail 80% of the time. The retry function will retry the function 5 times, with a delay of 1 second between each retry. The delay will be multiplied by 2 after each retry.  
The function will not retry if the error is not equal to 'KO'.

## Advanced usage - shouldRetryOnResolve

You can also retry on resolve, if you want to retry only if a specific result is returned.

```js
const {retryCatchable} = require('retry-catch');

const fnWithChanceOfFailing = (chanceOfFailing = 0.8) => {
  return new Promise((resolve, reject) => {
    if (Math.random() < chanceOfFailing) {
      reject('KO');
      return;
    }
    resolve(Math.random() < 0.8 ? 'OK' : 'REAL-OK');
  });
};

const retryFn = retryCatchable(fnWithChanceOfFailing, {
  retries: 5,
  delay: 1000,
  backoff: 2,
  shouldRetryOnResolve: (result) => {
    return result === 'OK';
  },
});

retryFn(0.8)
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.log(error);
  });
```

The function will randomly fail 80% of the time. The retry function will retry the function 5 times, with a delay of 1 second between each retry. The delay will be multiplied by 2 after each retry.  
The function will not retry if the result is not equal to 'OK'.

# API

The `retryCatchable` function takes 2 parameters:
- The function to retry (the function must return a promise).
- An object containing the list of options. You can pass the following properties and methods, all of them are optional:
  - `retries`: The number of retries to attempt. Default: `3`.
  - `delay`: The delay between every retry. Default: `1000`.
  - `backoff`: The backoff multiplier. Every delay will be multiplied by this amount. Default: `1`.
  - `shouldRetryOnResolve`: A function that will be called with the result of the function. If it returns `true`, the function will be retried. Default: `undefined`.
  - `shouldRetryOnReject`: A function that will be called with the error of the function. If it returns `true`, the function will be retried. Default: `undefined`.

# Tests

You can run the tests by using the following command:

```bash
npm test
```

# ToDo

- [ ] Add event listening (onRetry, etc.)