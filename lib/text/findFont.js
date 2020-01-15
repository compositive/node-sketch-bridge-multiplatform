const hashStyle = require("../util/hashStyle");
const getComputedTextStyle = require("./getComputedTextStyle");

const { findFontSync } = require("font-manager");
const fontkit = require("fontkit");

const _cache = new Map();

module.exports = function findFont(style, refreshCache = false) {
  const { fontFamily, fontWeight, fontStyle } = getComputedTextStyle(style);
  const cacheKey = hashStyle({ fontFamily, fontWeight, fontStyle });

  if (refreshCache || !_cache.has(cacheKey)) {
    const fontInfo = findFontSync({
      family: fontFamily,
      italic: fontStyle === "italic",
      weight: fontWeight
    });

    if (fontInfo) {
      // TODO Implement fallback logic
      let font = fontkit.openSync(fontInfo.path);
      if ("fonts" in font) font = font.getFont(fontInfo.postscriptName);

      _cache.set(cacheKey, font);
    }
  }

  return _cache.get(cacheKey);
};
