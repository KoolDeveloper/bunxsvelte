import { $ } from "bun";

console.log("🚀 Starting build process...");

// 1. Clean previous builds
console.log("🧹 Cleaning up...");
await $`rm -rf build myapp`;

// 2. Build the SvelteKit app
console.log("🏗️  Building SvelteKit app...");
// This uses svelte-adapter-bun to generate the 'build/' folder
await $`bun run build`;

// 3. Compile the build into a single executable
console.log("📦 Packaging into executable...");

// The entry point for svelte-adapter-bun is typically build/index.js
// We compile it into an executable named 'myapp' (you can rename this)
await $`bun build --compile --minify --sourcemap ./build/index.js --outfile myapp`;

console.log("✅ Done! Your executable is ready: ./myapp");
console.log("NOTE: Ensure 'database.sqlite' is in the same directory when running the executable.");
