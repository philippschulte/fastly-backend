'use strict';

const config = {
  delay: 3000,
  token: 'fastly_api_token',
  body: {
    shield: 'mdw-il-us'
  },
  affected(backend) {
    return backend.shield === 'ord-il-us';
  }
};

module.exports = config;
