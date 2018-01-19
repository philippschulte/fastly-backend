'use strict';

const config = require('../src/config');

describe('#config', () => {
  test('should be defined', () => {
    expect(config).toBeDefined();
  });

  test('should be an object', () => {
    expect(typeof config).toBe('object');
  });

  test('should have delay, token, body, and affected properties', () => {
    expect(config).toHaveProperty('delay');
    expect(config).toHaveProperty('token');
    expect(config).toHaveProperty('body');
    expect(config).toHaveProperty('affected');
  });

  test('should have proper types', () => {
    expect(typeof config.delay).toBe('number');
    expect(typeof config.token).toBe('string');
    expect(typeof config.body).toBe('object');
    expect(typeof config.affected).toBe('function');
  });
});
