'use strict';

const services = require('../src/services');

describe('#services', () => {
  test('should be defined', () => {
    expect(services).toBeDefined();
  });

  test('should be an array of strings', () => {
    expect(Array.isArray(services)).toBeTruthy();
    
    services.forEach(service => {
      expect(typeof service).toBe('string');
    });
  });
});
