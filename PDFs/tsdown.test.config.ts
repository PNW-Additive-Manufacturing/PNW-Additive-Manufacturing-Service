import { defineConfig } from "tsdown";
import { baseConfig } from "./tsdown.base.config";

export default defineConfig({
    entry: ["src/test.ts"],
    outDir: "dist/test",
    ...baseConfig
});