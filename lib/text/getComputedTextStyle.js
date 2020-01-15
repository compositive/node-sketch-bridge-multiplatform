const FONT_WEIGHTS = {
  normal: 400,
  bold: 700
};
const DEFAULT_FONT_FAMILY = "Helvetica";
const DEFAULT_FONT_SIZE = 14;
const DEFAULT_LINE_HEIGHT_MULTIPLIER = 1.19;

module.exports = function getComputedTextStyle(style) {
  const fontSize = style.fontSize || DEFAULT_FONT_SIZE;
  return {
    fontSize,
    fontWeight: "fontWeight" in style ? FONT_WEIGHTS[style.fontWeight] || style.fontWeight : 400,
    fontFamily: style.fontFamily || DEFAULT_FONT_FAMILY,
    fontStyle: style.fontStyle === "italic" ? "italic" : "normal",
    lineHeight: style.lineHeight || Math.round(fontSize * DEFAULT_LINE_HEIGHT_MULTIPLIER),
    letterSpacing: style.letterSpacing || 0,
    textTransform: style.textTransform || "none"
  };
};
