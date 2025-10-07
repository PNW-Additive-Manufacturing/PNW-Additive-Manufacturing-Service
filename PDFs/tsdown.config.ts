import { defineConfig } from "tsdown";
import { baseConfig } from "./tsdown.base.config";

export default defineConfig({
    entry: ["src/index.ts"],
    outDir: "dist",
    ...baseConfig
});