import type { Options } from "tsdown";

export const baseConfig: Options = {
    format: ["es", "cjs"],
    platform: "node",
    minify: false,
    loader: {
        ".png": "dataurl",  // PDFKit only support path and dataurl as embedded inputs.
        ".ttf": "binary",   // PDFKit only supports a path and UInt8Array as font file inputs. 
    }
};
