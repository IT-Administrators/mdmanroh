import * as assert from "assert";
import { mockDocument } from "./mockdocument";
import { extractInlineLinks } from "../linklabelhandling";

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

(function testSkipsLinksInsideCodeBlocks() {
  const doc = mockDocument(`
Here is a link [One](https://one.com)

\`\`\`
This is code with [Fake](https://fake.com)
\`\`\`

Outside [Two](https://two.com)
`);

  const links = extractInlineLinks(doc);

  assert.strictEqual(links.length, 2);
  assert.deepStrictEqual(
    links.map(l => l.text).sort(),
    ["One", "Two"]
  );

  console.log("testSkipsLinksInsideCodeBlocks passed");
})();

(function testSkipsIndentedCodeBlocks() {
  const doc = mockDocument(`
Normal [One](https://one.com)

    This is code with [Fake](https://fake.com)

Another [Two](https://two.com)
`);

  const links = extractInlineLinks(doc);

  assert.strictEqual(links.length, 2);
  assert.deepStrictEqual(
    links.map(l => l.text).sort(),
    ["One", "Two"]
  );

  console.log("testSkipsIndentedCodeBlocks passed");
})();

(function testSkipsBlockquoteLinks() {
  const doc = mockDocument(`
> Quote with [Fake](https://fake.com)
Normal [Real](https://real.com)
`);

  const links = extractInlineLinks(doc);

  assert.strictEqual(links.length, 1);
  assert.strictEqual(links[0].text, "Real");

  console.log("testSkipsBlockquoteLinks passed");
})();

(function testSkipsMalformedLinks() {
  const doc = mockDocument(`
Broken [Link](not closed
Broken [Another]not-a-link)
Valid [Good](https://good.com)
`);

  const links = extractInlineLinks(doc);

  assert.strictEqual(links.length, 1);
  assert.strictEqual(links[0].text, "Good");

  console.log("testSkipsMalformedLinks passed");
})();

(function testDuplicateLinksAreExtracted() {
  const doc = mockDocument(`
[Google](https://google.com)
[Google](https://google.com)
`);

  const links = extractInlineLinks(doc);

  assert.strictEqual(links.length, 2);
  assert.strictEqual(links[0].text, "Google");
  assert.strictEqual(links[1].text, "Google");

  console.log("testDuplicateLinksAreExtracted passed");
})();
