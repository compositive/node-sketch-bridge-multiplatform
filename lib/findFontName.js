const findFont = require("./text/findFont");

module.exports = function findFontName(style) {
  return findFont(style).postscriptName;
};
