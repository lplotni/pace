const configMock = (function mockedConfiguration() {
  const originalConfig = require('config');
  let mockedValues = {};

  const mockValue = (key, value) => {
    mockedValues[key] = value;
  };

  const get = (key) => {
    return mockedValues.hasOwnProperty(key) ? mockedValues[key] : originalConfig.get(key);
  };

  const reset = () => {
    mockedValues = {};
  };

  return {
    get,
    reset,
    mockValue
  }
})();


module.exports = configMock;
