const murmurHash = require("murmur2js");
const sortObjectKeys = require("./sortObjectKeys");

module.exports = function hashStyle(obj) {
  if (obj) {
    return String(murmurHash(JSON.stringify(sortObjectKeys(obj))));
  }
  return "0";
};
