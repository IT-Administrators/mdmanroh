import * as assert from "assert";
import { convertInlineToReferenceCore } from "../commands/convertinlinelinktoref";

(function testBasicConversion() {
  const result = convertInlineToReferenceCore(
    { text: "Google", url: "https://google.com" },
    "google"
  );

  assert.strictEqual(result.replacement, "[Google][google]");
  assert.strictEqual(result.reference, "[google]: https://google.com");

  console.log("testBasicConversion passed");
})();

(function testSpacesInLabel() {
  const result = convertInlineToReferenceCore(
    { text: "My Link", url: "https://example.com" },
    "my-link"
  );

  assert.strictEqual(result.replacement, "[My Link][my-link]");
  assert.strictEqual(result.reference, "[my-link]: https://example.com");

  console.log("testSpacesInLabel passed");
})();
