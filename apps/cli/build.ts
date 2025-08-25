await Bun.build({
  entrypoints: ["./src/index.ts"],
  banner: "#!/usr/bin/env node",
  format: "esm",
  minify: true,
  outdir: "dist",
  target: "node",
});
