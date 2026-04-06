declare module "pdfkit" {
  interface PDFKitTextOptions {
    align?: "left" | "center" | "right" | "justify";
  }

  interface PDFKitDocumentOptions {
    size?: string;
    margin?: number;
  }

  class PDFDocument {
    constructor(options?: PDFKitDocumentOptions);
    on(event: "data", listener: (chunk: Buffer) => void): this;
    on(event: "end", listener: () => void): this;
    fontSize(size: number): this;
    text(text: string, options?: PDFKitTextOptions): this;
    moveDown(lines?: number): this;
    end(): void;
  }

  export default PDFDocument;
}
