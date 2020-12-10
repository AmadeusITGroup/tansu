const originalConfig = require('./karma.conf');

module.exports = function (config) {
  originalConfig(config);

  const seleniumHost = process.env.SELENIUM_HOSTNAME;

  if (seleniumHost) {
    const SeleniumChromeLauncher = {
      base: 'Selenium',
      name: 'Karma Test',
      config: {
        desiredCapabilities: {
          browserName: 'chrome',
          chromeOptions: {
            args: ['headless', 'disable-translate', 'disable-extensions', 'window-size=1280x800'],
          },
        },
        host: seleniumHost,
        port: 4444,
        path: '/wd/hub',
      },
    };

    config.set({
      plugins: [...config.plugins, require('karma-selenium-launcher')],
      customLaunchers: {
        SeleniumChrome: SeleniumChromeLauncher,
      },
      hostname: process.env.SERVER_HOSTNAME,
      browsers: ['SeleniumChrome'],
    });
  } else {
    config.set({
      browsers: ['ChromeHeadless'],
    });
  }
};
