/** Test mock to virtualize a document. */
export function mockDocument(text: string) {
  return {
    getText: () => text,

    positionAt(offset: number) {
      const lines = text.slice(0, offset).split("\n");
      const line = lines.length - 1;
      const character = lines[lines.length - 1].length;
      return { line, character };
    },

    lineAt(line: number) {
      const lines = text.split("\n");
      return { text: lines[line] };
    },

    lineCount: text.split("\n").length
  };
}