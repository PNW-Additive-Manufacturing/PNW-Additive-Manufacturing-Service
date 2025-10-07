/**
 * Writes the contents of a PDFKit PDFDocument to the given NodeJS Writeable stream.
 * 
 * Do not use doc.pipe() before using this function. It would result in two PDFs in one stream (causing corruption)!
 */
export function writePDFToStream(pdf: PDFKit.PDFDocument, writeStream: NodeJS.WritableStream): Promise<void | Uint8Array> {
    return new Promise((resolve, reject) => {

        writeStream.on("end", resolve);
        writeStream.on("error", reject);

        pdf.pipe(writeStream);
        pdf.end();

    });
}