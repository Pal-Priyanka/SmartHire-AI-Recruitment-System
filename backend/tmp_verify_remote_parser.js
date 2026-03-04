import { extractRawText } from './services/resumeParser.js';

// Using a publicly available PDF for testing (or you can use a sample Cloudinary PDF if you have one)
// For now, let's use a mock check to see if the axios logic is reachable
const testUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

console.log("Testing remote PDF extraction from:", testUrl);

try {
    const text = await extractRawText(testUrl);
    console.log("--- Extracted Text Preview ---");
    console.log(text.substring(0, 500));
    console.log("\nExtraction Successful:", text.length > 0);
} catch (error) {
    console.error("Test failed:", error);
}
