// Container for all the environment
var environments = {}

// Staging (default) environments

environments.staging = {
    'port': 3000,
    'envName': 'staging'
}

environments.production = {
    "port": 5000,
    'envName': 'production'
}

// Define which one should be exported 
var currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';


// Check that the current environment is one of the environments above, if not default to staging
var environmentToExport = typeof (environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport