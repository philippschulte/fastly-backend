'use strict';

const sleep = require('./sleep');
const config = require('./config');
const services = require('./services');
const fastly = require('fastly-promises');

(async () => {
  try {    
    for (const id of services) {
      const service = fastly(config.token, id);
      const versions = await service.readVersions();
      const active = versions.data.filter(version => version.active)[0];
      const backends = await service.readBackends(active.number);
      const infected = backends.data.filter(config.infected);
      
      if (!infected.length) continue;

      console.log(`Updating serivce: ${id}`);
      
      const clone = await service.cloneVersion(active.number);
      await Promise.all(infected.map(backend => service.updateBackend(clone.data.number, backend.name, config.body)));
      await service.activateVersion(clone.data.number);
      
      console.log(`Updated service: ${id}, version: ${clone.data.number}`);
      
      await sleep(config.delay);
    }
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
})();
