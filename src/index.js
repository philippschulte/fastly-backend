'use strict';

let ids = require('./ids');
const sleep = require('./sleep');
const config = require('./config');
const fastly = require('fastly-promises');

(async () => {
  try {
    if (!ids.length) {
      const services = await fastly(config.token).readServices();
      ids = services.data.map(service => service.id);
    }
    
    for (const id of ids) {
      const service = fastly(config.token, id);
      const versions = await service.readVersions();
      const active = versions.data.filter(version => version.active)[0];
      const backends = await service.readBackends(active.number);
      const affected = backends.data.filter(config.affected);
      
      if (!affected.length) continue;

      console.log(`Updating serivce: ${id}`);
      
      const clone = await service.cloneVersion(active.number);
      await Promise.all(affected.map(backend => service.updateBackend(clone.data.number, backend.name, config.body)));
      await service.activateVersion(clone.data.number);
      
      console.log(`Updated service: ${id}, version: ${clone.data.number}`);
      
      await sleep(config.delay);
    }
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
})();
