import { parseResume, extractRawText } from './services/resumeParser.js';

// Test with a sample remote PDF if possible, or a local one that simulates the issue
const testUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

async function runTest() {
    console.log("--- Testing Robust Parsing fix ---");
    console.log("Fetching and parsing:", testUrl);

    try {
        const text = await extractRawText(testUrl);
        console.log("Raw Text Extracted (first 100 chars):", text.substring(0, 100));

        const data = await parseResume(testUrl);
        console.log("Parsed Data Results:", JSON.stringify(data, null, 2));

        if (data) {
            console.log("\nSuccess: Parser handled remote URL correctly.");
        } else {
            console.log("\nFailure: Parser returned null.");
        }
    } catch (err) {
        console.error("Test Error:", err);
    }
}

runTest();
