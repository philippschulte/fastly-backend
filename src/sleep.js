'use strict';

const sleep = (ms = 0) => new Promise(r => setTimeout(() => r(ms), ms));

module.exports = sleep;
