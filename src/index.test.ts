import { retryCatch } from './index';

const myFunction = (chanceOfFailing = 0.8) => {
  return new Promise((resolve, reject) => {
    console.log('in fn', chanceOfFailing);
    if (Math.random() < chanceOfFailing) {
      console.log('in fn - reject');
      reject('In - KO!');
      return;
    }
    console.log('in fn - resolve');
    resolve('In - OK!');
  });
};

it('should retry 4 times at most', async () => {
  let shouldFail = true;
  try {
    await retryCatch(
      () => {
        return myFunction(1);
      },
      {
        retries: 4,
        delay: 100,
        backoff: 1
      }
    );
  } catch (e) {
    shouldFail = false;
    expect(true).toBe(true);
  }
  shouldFail && expect(true).toBe(false);
  // await new Promise((resolve) => setTimeout(resolve, 900));
});
