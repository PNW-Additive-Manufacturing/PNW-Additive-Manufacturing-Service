import * as fs from "node:fs";
import { makeQuotePDF } from "./quote";
import MemoryStream from "memorystream";

async function runTest() {

    const TEST_PDF_PATH = "./test_output.pdf";
    
    console.log("Running PDF generation test...");

    try {

        const writeStream = new MemoryStream();
    
        await makeQuotePDF({
                contact: {
                    name: "Test User",
                    email: "test@example.com",
                },
                preparer: {
                    name: "Test Preparer",
                    email: "preparer@example.com",
                },
                preparedAt: new Date(),
                payment: {
                    paidAt: new Date(),
                    paymentMethod: "TooCOOL",
                    tooCOOLInvoice: 137015
                },
                feesCostInCents: 0,
                items: [
                    {
                        name: "Print Per Gram (PLA)",
                        quantity: 19,
                        unitCostInCents: 10,
                        discountPercent: 0,
                        taxInCents: 13
                    },
                ]
            }, writeStream);

        console.log("PDF generation complete");

        await fs.promises.writeFile(TEST_PDF_PATH, writeStream);

        const stats = await fs.promises.stat(TEST_PDF_PATH);
        console.log(`PDF file size: ${stats.size} bytes`);

        if (stats.size  === 0) throw new Error("PDF file is empty");
        
        // await fs.promises.unlink(TEST_PDF_PATH);
        console.log("Test cleanup complete");
        
        process.exit(0);

    } catch (err) {

        console.error("Error during test:", err);
        process.exit(1);

    }
}

runTest();