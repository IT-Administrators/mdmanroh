import * as assert from "assert";
import { extractInlineLinks } from "../linklabelhandling";

// Minimal mock of vscode.TextDocument
function mockDocument(text: string) {
  return {
    getText: () => text,
    positionAt: (offset: number) => {
      const lines = text.slice(0, offset).split("\n");
      const line = lines.length - 1;
      const character = lines[lines.length - 1].length;
      return { line, character };
    },
    lineAt: (line: number) => {
      const lines = text.split("\n");
      return { text: lines[line] };
    },
    lineCount: text.split("\n").length
  };
}

(function testExtractsSimpleInlineLink() {
  const doc = mockDocument("This is a [Google](https://google.com) link.");

  const links = extractInlineLinks(doc);

  assert.strictEqual(links.length, 1);
  assert.strictEqual(links[0].text, "Google");
  assert.strictEqual(links[0].url, "https://google.com");

  console.log("testExtractsSimpleInlineLink passed");
})();

(function testSkipsHeadings() {
  const doc = mockDocument(`
# [Heading](#anchor)
## [Another](#anchor2)
Normal [Link](https://example.com)
`);

  const links = extractInlineLinks(doc);

  assert.strictEqual(links.length, 1);
  assert.strictEqual(links[0].text, "Link");

  console.log("testSkipsHeadings passed");
})();

(function testSkipsInternalAnchors() {
  const doc = mockDocument(`
1. [HL 1](#hl-1)
2. [HL 2](#hl-2)
Paragraph [Real](https://real.com)
`);

  const links = extractInlineLinks(doc);

  assert.strictEqual(links.length, 1);
  assert.strictEqual(links[0].text, "Real");

  console.log("testSkipsInternalAnchors passed");
})();

(function testSkipsImageLinks() {
  const doc = mockDocument(`
![Alt](https://example.com/image.png)
Text [Link](https://example.com)
`);

  const links = extractInlineLinks(doc);

  assert.strictEqual(links.length, 1);
  assert.strictEqual(links[0].text, "Link");

  console.log("testSkipsImageLinks passed");
})();

(function testSkipsSetextHeadings() {
  const doc = mockDocument(`
Title
-----
Paragraph [Link](https://example.com)
`);

  const links = extractInlineLinks(doc);

  assert.strictEqual(links.length, 1);
  assert.strictEqual(links[0].text, "Link");

  console.log("testSkipsSetextHeadings passed");
})();

(function testMultipleInlineLinks() {
  const doc = mockDocument(`
Here is [One](https://one.com) and [Two](https://two.com)
`);

  const links = extractInlineLinks(doc);

  assert.strictEqual(links.length, 2);
  assert.deepStrictEqual(
    links.map(l => l.text).sort(),
    ["One", "Two"]
  );

  console.log("testMultipleInlineLinks passed");
})();
