module.exports = function sortObjectKeys(obj) {
  const keys = Object.keys(obj).sort();

  return keys.reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});
};
