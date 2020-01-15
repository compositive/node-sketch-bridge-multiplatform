const applyTextTransform = require("./applyTextTransform");
const findFont = require("./findFont");
const getComputedTextStyle = require("./getComputedTextStyle");

// TODO: Account for justification
module.exports = function computeTextNodeLayout(textNode) {
  const { content, textStyles } = textNode;
  const { fontSize, lineHeight, letterSpacing, textTransform } = getComputedTextStyle(textStyles);
  const font = findFont(textStyles);

  const transformedContent = applyTextTransform(content, textTransform);
  const layout = font.layout(transformedContent);
  const sizeFactor = fontSize / font.unitsPerEm;

  let width = 0;
  for (const position of layout.positions) {
    width += position.xAdvance * sizeFactor + letterSpacing;
  }

  return { width, height: lineHeight };
};
