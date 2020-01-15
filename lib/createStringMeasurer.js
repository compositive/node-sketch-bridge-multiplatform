const StyledText = require("./text/StyledText");

module.exports = function createStringMeasurer(textNodes, boxWidth) {
  const styledText = new StyledText(textNodes);
  const lines = styledText.toLines(boxWidth);

  return {
    width: lines.reduce((maxWidth, { width }) => Math.max(maxWidth, width), 0),
    height: lines.reduce((totalHeight, { height }) => totalHeight + height, 0)
  };
};
