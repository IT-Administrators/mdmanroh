import * as assert from 'assert';
import { extractReferenceLabels } from '../extractreflabel';

// Import the function you want to test
// Adjust the path to match your project structure

// Mock a minimal TextDocument-like object
function mockDocument(text:string) {
  return {
    getText() {
      return text;
    }
  };
}

//
// ────────────────────────────────────────────────────────────────
//   TESTS FOR extractReferenceLabels
// ────────────────────────────────────────────────────────────────
//

(function testExtractsSingleReference() {
  const doc = mockDocument("[github]: https://github.com");

  const result = extractReferenceLabels(doc);

  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].label, "github");
  assert.strictEqual(result[0].url, "https://github.com");

  console.log("testExtractsSingleReference passed");
})();

(function testExtractsMultipleReferences() {
  const doc = mockDocument(`
    [github]: https://github.com
    [docs]: https://example.com/docs
    [api]: https://api.example.com
  `);

  const result = extractReferenceLabels(doc);

  assert.strictEqual(result.length, 3);

  const labels = result.map(r => r.label);
  assert.deepStrictEqual(labels.sort(), ["api", "docs", "github"]);

  console.log("testExtractsMultipleReferences passed");
})();

(function testIgnoresInlineLinks() {
  const doc = mockDocument(`
    This is an inline link [Google](https://google.com)
    [ref]: https://example.com
  `);

  const result = extractReferenceLabels(doc);

  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].label, "ref");

  console.log("testIgnoresInlineLinks passed");
})();

(function testHandlesWhitespace() {
  const doc = mockDocument(`
    [ spaced ]:   https://example.com/space
  `);

  const result = extractReferenceLabels(doc);

  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].label, " spaced ");
  assert.strictEqual(result[0].url, "https://example.com/space");

  console.log("testHandlesWhitespace passed");
})();

