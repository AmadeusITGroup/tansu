const originalConfig = require('./karma.conf');

module.exports = function (config) {
  originalConfig(config);
  config.set({
    browsers: ['ChromeHeadless'],
  });
};
