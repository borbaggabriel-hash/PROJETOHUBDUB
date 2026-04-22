import { build } from "esbuild";

await build({
  entryPoints: ["server/index.ts"],
  platform: "node",
  bundle: true,
  format: "cjs",
  outfile: "dist/server.cjs",
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  minify: true,
  external: [
    // native / binary modules — must be excluded
    "bcryptjs",
    "pg",
    "pg-native",
  ],
  logLevel: "info",
});

console.log("Server bundle → dist/server.cjs");
