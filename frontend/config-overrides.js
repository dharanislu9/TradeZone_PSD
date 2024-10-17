module.exports = {
    jest: function(config) {
      config.transformIgnorePatterns = [
        '/node_modules/(?!axios)' // Transform axios and other ES modules
      ];
      return config;
    },
  };
  