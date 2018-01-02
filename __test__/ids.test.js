'use strict';

const ids = require('../src/ids');

describe('#ids', () => {
  test('should be defined', () => {
    expect(ids).toBeDefined();
  });

  test('should be an array of strings', () => {
    expect(Array.isArray(ids)).toBeTruthy();
    
    ids.forEach(service => {
      expect(typeof service).toBe('string');
    });
  });
});
