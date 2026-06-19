// Builds the extension into dist/: copies static assets from public/ and
// bundles the TypeScript entry points with esbuild.
import * as esbuild from "esbuild";
import { cpSync, rmSync, mkdirSync } from "node:fs";

const watch = process.argv.includes("--watch");

function copyStatic() {
    rmSync("dist", { recursive: true, force: true });
    mkdirSync("dist", { recursive: true });
    cpSync("public", "dist", { recursive: true });
}

const options = {
    entryPoints: {
        background: "src/background.ts",
        options: "src/options.ts",
        options_test: "src/options_test.ts",
    },
    bundle: true,
    format: "iife",
    target: "chrome92",
    outdir: "dist",
    legalComments: "none",
    logLevel: "info",
};

copyStatic();

if (watch) {
    const ctx = await esbuild.context(options);
    await ctx.watch();
    console.log("watching for changes...");
} else {
    await esbuild.build(options);
    console.log("build complete -> dist/");
}
