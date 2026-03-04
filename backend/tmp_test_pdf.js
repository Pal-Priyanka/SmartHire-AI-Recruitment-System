import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const _pdf = require('pdf-parse');
import fs from 'fs';

async function test() {
    console.log("Keys:", Object.keys(_pdf));
    const PDFParse = _pdf.PDFParse;
    console.log("PDFParse type:", typeof PDFParse);

    // Create a dummy pdf or try to read one if it exists
    const testPdf = 'dummy.pdf'; // I'll hope some pdf exists or I'll just see if the class initializes

    try {
        const parser = new PDFParse({ data: Buffer.from("test") });
        console.log("Parser instance created");
        // We expect an error here because data is not a real pdf, but we want to see if it's a class
    } catch (e) {
        console.log("Error (expected if class):", e.message);
    }
}

test();
