# fastly-backend

> Script to update Fastly backend definitions in one batch

## Problem

In November 2017 Fastly Support notified all customers who utilized the Chicago (ORD) site for shielding purposes. All affected services needed to be migrated over to a new Chicago (MDW) datacenter. The necessary migration steps needed to be done manually by the customer via the [Fastly Application](https://manage.fastly.com/) or the [Fastly API](https://docs.fastly.com/api/). The steps included:

- Iterate over all affected services
  - Clone the currently active version
  - Update all affected backends
  - Activate the cloned version

This won't be the last time that Fastly performs network migrations to new datacenters and notifies their customers to update their backend configurations. There are other scenarios where you need to update backend fields. For instance, if you need to change connection timeouts because of `503` backend read errors.

You always have to clone a version if you want to make any changes to a service configuration. Then you have to filter and update all affected backends and at the end, you have to activate the cloned version. These steps can be very time-consuming especially if you manage staging and production services with many backend definitions.

## Solution

All necessary steps like cloning, filtering, updating, and activating are performed in a fully automated fashion with the help of the [fastly-promises](https://www.npmjs.com/package/fastly-promises) package:

- Iterate over all services synchronously
  - Get all the versions [GET /service/service_id/version](https://docs.fastly.com/api/config#version_dfde9093f4eb0aa2497bbfd1d9415987)
  - Filter out the active version
  - Get all the backends for the active version [GET /service/service_id/version/version_no/backend](https://docs.fastly.com/api/config#backend_fb0e875c9a7669f071cbf89ca32c7f69)
  - Filter out the affected backends
  - Continue with the next service if there are no affected backends
  - Clone the active version [PUT /service/service_id/version/version_no/clone](https://docs.fastly.com/api/config#version_7f4937d0663a27fbb765820d4c76c709)
  - Update all the affected backends parallelly [PUT /service/service_id/version/version_no/backend/backend_name](https://docs.fastly.com/api/config#backend_fb3b3529417c70f57458644f7aec652e)
  - Activate the cloned version [PUT /service/service_id/version/version_no/activate](https://docs.fastly.com/api/config#version_0b79ae1ba6aee61d64cc4d43fed1e0d5)

You can hard-code the service IDs in `src/ids.js` if you only want to iterate over certain services. Otherwise, the script performs a request to [GET /services](https://docs.fastly.com/api/config#service_74d98f7e5d018256e44d1cf820388ef8) in order to fetch all service IDs associated with the Fastly API token you need you specify in `src/config.js`.

## Table of Contents

- [Security](#security)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Examples](#examples)
- [Tests](#tests)
- [Contribute](#contribute)
- [License](#license)

## Security

You'll need a [Fastly API Token](https://docs.fastly.com/api/auth#tokens) in order to run the script. The token must have a [global scope](https://docs.fastly.com/api/auth#access) because the script performs requests to readable and writable endpoints.

## Getting Started

These instructions will get you a copy of the script up and running on your local machine for execution, development, and testing purposes.

### Prerequisites

There is only one prerequisite required to install all dependencies and to run the script:

- Node.js - [Download & Install Node.js version 8 or above](https://nodejs.org/en/) and the npm package manager.

For Mac users I recommend to use [Homebrew](https://brew.sh/) to install the latest version of Node.js:

```bash
$ brew update
$ brew install node
```

If you're a Mac user and you just need to upgrade your Node.js version to the latest and greatest:

```bash
$ brew update
$ brew upgrade node
```

### Downloading

There are several ways you can get the script:

#### Cloning The GitHub Repository

The recommended way is to use `git` to directly clone the repository:

```bash
$ git clone https://github.com/philippschulte/fastly-backend.git
```

This will clone the latest version to a `fastly-backend` folder.

#### Downloading The Repository Zip File

Another way is to download a zip copy from the [master branch on GitHub](https://github.com/philippschulte/fastly-backend/archive/master.zip). You can also do this using the `wget` command:

```bash
$ wget https://github.com/philippschulte/fastly-backend/archive/master.zip -O fastly-backend.zip; unzip fastly-backend.zip; rm fastly-backend.zip; mv fastly-backend-master fastly-backend
```

### Install

To install the dependencies, run this in the application folder from the command-line:

```bash
$ npm install
```

Now you're ready to open the `fastly-backend` folder in your favorite code editor to make the necessary changes in order to run the script.

### Project Structure

You'll need to update certain files before you're able to run the script. The full `fastly-backend` folder structure is explained below:

|      Name    	|                                                                         Description                                                        	          |
|:-------------	|:----------------------------------------------------------------------------------------------------------------------------------------------------- |
| __test__      | Contains all test files.                                                                                                                 	            |
| node_modules  | Contains all `npm` dependencies.                                                                                                          	          |
| src           | Contains all source code files.                                                                                                            	          |
| src/config.js | Used to configure the script. **This file needs to be updated before you run the script!**                                                            |
| src/ids.js    | List of all service IDs. **This file needs to be updated in case you don't want to iterate over all services associated with your Fastly API token!** |
| src/index.js  | The main script file.                                                                                                                                 |
| src/sleep.js  | Delays the program execution after each iteration for the given number of milliseconds.                                                      	        |
| .gitignore    | Specifies intentionally untracked files to ignore.                                                                                       	            |
| package.json  | File that contains all `npm` dependencies.                                                                                                 	          |

### Running The Script

To execute the script, run this in the `fastly-backend` folder from the command-line:

```bash
$ npm start
```

## Usage

Before you're able to run the script you have to update `src/config.js`. This is the only file which needs to be configured in case you want to iterate over all services associated with your Fastly API token. However, if you only want to iterate over certain services associated with your Fastly API token then you need to list the service IDs in `src/ids.js`. Let's have a look at `src/config.js` and `src/ids.js` to see how they need to be configured.

### src/config.js

The configuration object of `src/config.js` contains a `delay`, `token`, `body`, and `affected` property. All four properties are required and need to be updated before you're able to run the script successfully.

```javascript
const config = {
  delay: 1000,
  token: 'fastly_api_token',
  body: {
    backend.name: 'fastly'
  },
  affected(backend) {
    return backend.name === 'slowly';
  }
};
```

| Field    	|   Type   	|                                                                                                                                                                                                                                                                                                    Description                                                                                                                                                                                        |
|:--------	|:--------	|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|
| delay    	| Integer  	| Required. Duration in milliseconds for how long you want the program to delay after each iteration.                                                                                                                                                                                                                                                                                                                                                                                                   |
| token    	| String   	| Required. Fastly API token with a [global scope](https://docs.fastly.com/api/auth#access) because the script is performing requests to readable and writable endpoints. Please keep in mind that a `token` is associated with only one Fastly account. You can't update services from different Fastly accounts with the same `token` and in one execution! The `token` needs to be associated with the service IDs in `src/ids.js` if you decide to iterate only over certain services.              |
| body     	| Object   	| Required. Data to be sent as the request body. Please have a look at the [Backend Fields](#backend-fields) table to find the most important fields you're able to update via the script.                                                                                                                                                                                                                                                                                                              |
| affected 	| Function 	| Required. Callback function to be run for each backend to determine whether it's affected. It returns a list of all affected backends that pass the test. Return `true` to add the backend to the affected list, `false` otherwise. Please use the [Backend Fields](#backend-fields) table when you define the condition to decide whether the backend is affected. You have access to all fields through the `backend` function parameter. You can access each backend field by using dot notation.  |

The example configuration above updates each backend with a name of `slowly` to `fastly`. You can actually find meaningful examples of `src/config.js` in the [examples](#examples) section. Before you modify `src/config.js` you should know which fields you want to update and which fields you want to use for the condition to filter out the affected backends. Below is a table of the most important available [backend](https://docs.fastly.com/api/config#backend_fb3b3529417c70f57458644f7aec652e) fields:

#### Backend Fields

| Field                 	| Type    	| Access     	| Description                                                                                                            	|
|-----------------------	|---------	|------------	|------------------------------------------------------------------------------------------------------------------------	|
| hostname              	| String  	| Read-only  	| The hostname of the backend.                                                                                           	|
| ipv4                  	| String  	| Read-only  	| IPv4 address of the host.                                                                                              	|
| ipv6                  	| String  	| Read-only  	| IPv6 address of the host.                                                                                              	|
| max_tls_version       	| String  	| Read/Write 	| Maximum allowed TLS version on SSL connections to this backend.                                                        	|
| error_threshold       	| Integer 	| Read/Write 	| Number of errors to allow before the backend is marked as down.                                                        	|
| first_byte_timeout    	| Integer 	| Read/Write 	| How long to wait for the first bytes in milliseconds.                                                                  	|
| weight                	| Integer 	| Read/Write 	| Weight used to load balance this backend against others.                                                               	|
| address               	| String  	| Read/Write 	| An hostname, IPv4, or IPv6 address for the backend.                                                                    	|
| connect_timeout       	| Integer 	| Read/Write 	| How long to wait for a timeout in milliseconds.                                                                        	|
| ssl_ciphers           	| String  	| Read/Write 	| [List of OpenSSL ciphers](https://www.openssl.org/docs/man1.0.2/apps/ciphers.html).                                    	|
| name                  	| String  	| Read/Write 	| The name of the backend.                                                                                               	|
| port                  	| Integer 	| Read/Write 	| The port number.                                                                                                       	|
| between_bytes_timeout 	| Integer 	| Read/Write 	| How long to wait between bytes in milliseconds.                                                                        	|
| auto_loadbalance      	| Boolean 	| Read/Write 	| Whether or not this backend should be automatically load balanced.                                                     	|
| ssl_check_cert        	| Boolean 	| Read/Write 	| Be strict on checking SSL certs. Setting to null will use the system default value (true).                             	|
| shield                	| String  	| Read/Write 	| The shield POP designated to reduce inbound load on this origin by serving the cached data to the rest of the network. 	|
| request_condition     	| String  	| Read/Write 	| Condition, which if met, will select this backend during a request.                                                    	|
| ssl_cert_hostname     	| String  	| Read/Write 	| Overrides ssl_hostname, but only for cert verification. Does not affect SNI at all.                                    	|
| ssl_sni_hostname      	| String  	| Read/Write 	| Overrides ssl_hostname, but only for SNI in the handshake. Does not affect cert validation at all.                     	|
| min_tls_version       	| String  	| Read/Write 	| Minimum allowed TLS version on SSL connections to this backend.                                                        	|
| healthcheck           	| String  	| Read/Write 	| The name of the health check to use with this backend.                                                                 	|
| max_conn              	| Integer 	| Read/Write 	| Maximum number of connections.                                                                                         	|
| use_ssl               	| Boolean 	| Read/Write 	| Whether or not to use SSL to reach the backend.                                                                        	|
| comment               	| String  	| Read/Write 	| A comment.                                                                                                             	|

### src/ids.js

You need to update `src/ids.js` in case you want the script to iterate only over certain services. Add all the service IDs to the list you want to iterate over. The script performs a request to [GET /services](https://docs.fastly.com/api/config#service_74d98f7e5d018256e44d1cf820388ef8) in order to fetch all services associated to the token you have specified in `src/config.js` if the list in `src/ids.js` is empty.

```javascript
const ids = [
  'SU1Z0isxPaozGVKXdv0eY',
  'GH3F0dfsDsrsHWEDwv4lH',
  'FW4W4dsfBsfeWDVZlr2bA'
];
```

Don't forget to place a comma after each item of the list. Please keep in mind that the list needs to be empty: `const ids = [];` in case you want to fetch and iterate over all services.

## Examples

### Update Shield Location

The following configuration updates the `shield` field to `mdw-il-us` if the backend is currently shielding in `ord-il-us`:

```javascript
const config = {
  delay: 500,
  token: 'fastly_api_token',
  body: {
    shield: 'mdw-il-us',
    comment: 'Last change: Update shield location from Chicago (ORD) to Chicago (MDW)'
  },
  affected(backend) {
    return backend.shield === 'ord-il-us';
  }
};
```

**Please keep in mind that you can erase your entire cache from the shield, if you switch your shield location. This will increase the requests to your origin server.**

### Update Connection Timeouts

The following configuration updates the `connect_timeout`, `first_byte_timeout`, and `between_bytes_timeout` fields back to the Varnish default:

```javascript
const config = {
  delay: 1000,
  token: 'fastly_api_token',
  body: {
    connect_timeout: 3500,
    first_byte_timeout: 60000,
    between_bytes_timeout: 60000,
    comment: 'Last change: Update connection timeouts back to Varnish default'
  },
  affected(backend) {
    return backend.connect_timeout !== 3500 && backend.first_byte_timeout !== 60000 && backend.between_bytes_timeout !== 60000;
  }
};
```

### Update Maximum Number Of Open Connections

The following configuration updates the `max_conn` field if the backend is currently allowing more than 10 open connections per cache node:

```javascript
const config = {
  delay: 1500,
  token: 'fastly_api_token',
  body: {
    max_conn: 10,
    comment: 'Last change: Update maximun number of open connections to 10'
  },
  affected(backend) {
    return backend.max_conn > 10;
  }
};
```

## Tests

To run the test suite, first install the dependencies, then run the [`npm test` command](https://docs.npmjs.com/cli/test):

```bash
$ npm install
$ npm test
```

## Contribute

PRs accepted. I am open to suggestions for improving this script.

## License

Licensed under the [MIT License](LICENSE) © 2018 Philipp Schulte
