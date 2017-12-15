'use strict';

const sleep = require('../src/sleep');

describe('#sleep', () => {
  test('should be defined', () => {
    expect(sleep).toBeDefined();
  });

  test('should be a function', () => {
    expect(typeof sleep).toBe('function');
  });

  test('should time-out for a specified period of time', async () => {
    expect(await sleep(1)).toBe(1);
    expect(await sleep(10)).toBe(10);
    expect(await sleep(100)).toBe(100);
  });
});
