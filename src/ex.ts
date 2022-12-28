import { retryCatch } from './lib';

const myFunction = () => {
  return new Promise((resolve, reject) => {
    console.log('Running myFunction');
    if (Math.random() < 0.8) {
      reject('In - KO!');
      return;
    }
    resolve('In - OK!');
  });
};

const retriableFunction = retryCatch(myFunction, {
  retries: 4,
  delay: 1000,
  backoff: 2
});

retriableFunction
  .then((result) => {
    console.log('Success!', result);
  })
  .catch((err) => {
    console.log('Failed!', err);
  });
