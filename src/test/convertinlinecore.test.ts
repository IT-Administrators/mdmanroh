import * as assert from "assert";
import { convertInlineToReferenceCore } from "../commands/convertinlinelinktoref";

(function testBasicConversion() {
  const link = { text: "Google", url: "https://google.com" };
  const label = "google";

  const result = convertInlineToReferenceCore(link, label);

  assert.strictEqual(result.replacement, "[Google][google]");
  assert.strictEqual(result.reference, "[google]: https://google.com");

  console.log("testBasicConversion passed");
})();

(function testLabelWithSpaces() {
  const link = { text: "My Link", url: "https://example.com" };
  const label = "my-link";

  const result = convertInlineToReferenceCore(link, label);

  assert.strictEqual(result.replacement, "[My Link][my-link]");
  assert.strictEqual(result.reference, "[my-link]: https://example.com");

  console.log("testLabelWithSpaces passed");
})();
