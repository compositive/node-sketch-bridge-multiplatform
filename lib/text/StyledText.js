const computeTextNodeLayout = require("./computeTextNodeLayout");

const LineBreaker = require("linebreak");
const ZERO_WIDTH_SPACE = "\u200B";

module.exports = class StyledText {
  static join(styledTexts) {
    const joinedTexts = new StyledText(styledTexts.flatMap(({ _textNodes }) => _textNodes));
    joinedTexts.endsWithRequiredBreak = styledTexts[styledTexts.length - 1].endsWithRequiredBreak;
    return joinedTexts;
  }

  constructor(textNodes, endsWithRequiredBreak = false) {
    this._textNodes = textNodes;
    this.endsWithRequiredBreak = endsWithRequiredBreak;
  }

  get length() {
    if (!("_length" in this)) {
      this._length = this._textNodes.reduce((accu, { content: length }) => accu + length, 0);
    }
    return this._length;
  }

  _findNodeAndOffsetPosition(pos) {
    let offsetPos = pos;

    for (let i = 0; i < this._textNodes.length; i += 1) {
      const node = this._textNodes[i];
      if (offsetPos >= node.content.length) offsetPos -= node.content.length;
      else return [node, offsetPos, i];
    }

    return [null, -1, -1];
  }

  concat(...texts) {
    return StyledText.join([this, ...texts]);
  }

  toLines(boxWidth) {
    const styledTextClusters = this.toWords();
    const lines = [];
    let currentLineWidth = 0;
    let currentLine = [];
    let lastWordHadRequiredBreak = false;

    for (const word of styledTextClusters) {
      lastWordHadRequiredBreak = currentLine.length > 0 && currentLine[currentLine.length - 1].endsWithRequiredBreak;

      if (lastWordHadRequiredBreak || currentLineWidth > boxWidth) {
        lines.push(StyledText.join(currentLine));
        currentLine = [];
        currentLineWidth = 0;
      }

      currentLine.push(word);
      currentLineWidth += word.width;
    }

    if (currentLine.length > 0) lines.push(StyledText.join(currentLine));
    return lines;
  }

  toWords() {
    const stringified = this.toString() + ZERO_WIDTH_SPACE; // fixes last line break not being considered required
    const breaker = new LineBreaker(stringified);
    const words = [];
    let last = 0;
    let bk;

    while ((bk = breaker.nextBreak())) {
      // get the string between the last break and this one
      const word = this.slice(last, bk.position);
      words.push(word);
      if (bk.required) word.endsWithRequiredBreak = true;

      last = bk.position;
    }

    // Add an empty word at the end if the last word required a break
    const lastWord = words[words.length - 1];
    if (lastWord.endsWithRequiredBreak) {
      const { textStyles } = lastWord._textNodes[lastWord._textNodes.length - 1];
      words.push(new StyledText({ content: "", textStyles }));
    }

    return words;
  }

  _computeNodeLayouts(refresh = false) {
    for (const node of this._textNodes) {
      if (refresh || !("_layout" in node)) {
        node._layout = computeTextNodeLayout(node);
      }
    }
  }

  get dimensions() {
    if (!this._dimensions) {
      this._computeNodeLayouts();
      const width = this._textNodes.reduce((accu, { _layout: { width } }) => width + accu, 0);
      const height = this._textNodes.reduce((max, { _layout: { height } }) => Math.max(max, height), 0);

      this._dimensions = { width, height };
    }

    return this._dimensions;
  }

  get width() {
    return this.dimensions.width;
  }

  get height() {
    return this.dimensions.height;
  }

  toString() {
    return this._textNodes.map(({ content }) => content).join("");
  }

  slice(start, end) {
    const slicedTextNodes = [];

    let offsetStart = start;
    let contentLengthRemaining = end - start;

    for (const node of this._textNodes) {
      const { content, textStyles } = node;
      if (contentLengthRemaining <= 0) {
        break; // nothing more to copy
      }

      if (offsetStart < content.length) {
        // we're copying nodes
        if (offsetStart <= 0 && contentLengthRemaining >= content.length) {
          // we can copy over an entire node
          slicedTextNodes.push(node);
          contentLengthRemaining -= content.length;
        } else {
          const slicedContent = content.substring(
            offsetStart,
            Math.min(contentLengthRemaining + offsetStart, content.length)
          );
          slicedTextNodes.push({ content: slicedContent, textStyles });
          contentLengthRemaining -= content.length - offsetStart;
        }
      }

      offsetStart -= content.length;
    }

    return new StyledText(slicedTextNodes);
  }
};
