// config-overrides.js
module.exports = {
    jest: (config) => {
      config.transformIgnorePatterns = [
        "/node_modules/(?!(axios)/)", // Transform axios to handle ES modules
      ];
      return config;
    },
  };
  